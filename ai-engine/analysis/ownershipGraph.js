
class OwnershipGraph {
  constructor() {
    this.nodes = new Map(); 
    this.edges = new Map(); 
    this.shellCompanyPatterns = new Map();
    this.riskCache = new Map();
  }


  addNode(companyId, data) {
    this.nodes.set(companyId, {
      id: companyId,
      name: data.name || '',
      pan: data.pan || '',
      cin: data.cin || '',
      registrationDate: data.registrationDate || null,
      directors: data.directors || [],
      nominees: data.nominees || [],
      shareholding: data.shareholding || {},
      address: data.address || '',
      turnover: data.turnover || 0,
      employeeCount: data.employeeCount || 0,
      businessActivity: data.businessActivity || '',
      lastFilingDate: data.lastFilingDate || null,
      addedAt: new Date().toISOString(),
      ...data
    });
  }

  addOwnershipEdge(fromId, toId, relationshipData) {
    const edgeKey = `${fromId}->${toId}`;
    
    this.edges.set(edgeKey, {
      from: fromId,
      to: toId,
      stake: relationshipData.stake || 0,
      type: relationshipData.type || 'OWNERSHIP', 
      startDate: relationshipData.startDate || null,
      role: relationshipData.role || null,
      ...relationshipData
    });

    if (!this.nodes.get(toId)) {
      this.addNode(toId, { name: toId });
    }
    if (!this.nodes.get(fromId)) {
      this.addNode(fromId, { name: fromId });
    }
  }


  findOwners(companyId, depth = 3) {
    const visited = new Set();
    const owners = [];

    const traverse = (nodeId, currentDepth, chain) => {
      if (currentDepth === 0 || visited.has(nodeId)) return;
      visited.add(nodeId);

      for (const [edgeKey, edge] of this.edges.entries()) {
        if (edge.to === nodeId && edge.type === 'OWNERSHIP') {
          const newChain = [...chain, { from: edge.from, stake: edge.stake }];
          owners.push({
            ownerId: edge.from,
            stake: edge.stake,
            chain: newChain,
            depth: depth - currentDepth
          });

          traverse(edge.from, currentDepth - 1, newChain);
        }
      }
    };

    traverse(companyId, depth, []);
    return owners;
  }

  findSubsidiaries(companyId, depth = 3) {
    const visited = new Set();
    const subsidiaries = [];

    const traverse = (nodeId, currentDepth, chain) => {
      if (currentDepth === 0 || visited.has(nodeId)) return;
      visited.add(nodeId);

      for (const [edgeKey, edge] of this.edges.entries()) {
        if (edge.from === nodeId && edge.type === 'OWNERSHIP') {
          const newChain = [...chain, { to: edge.to, stake: edge.stake }];
          subsidiaries.push({
            subsidiaryId: edge.to,
            stake: edge.stake,
            chain: newChain,
            depth: depth - currentDepth
          });
          traverse(edge.to, currentDepth - 1, newChain);
        }
      }
    };

    traverse(companyId, depth, []);
    return subsidiaries;
  }


  detectUltimateBeneficialOwners(companyId, stakeThreshold = 0.1) {
    const owners = this.findOwners(companyId, 10);
    const ultimateOwners = new Map();

    owners.forEach(owner => {
      let cumulativeStake = 1;
      owner.chain.forEach(link => {
        cumulativeStake *= (link.stake / 100);
      });

      if (cumulativeStake >= stakeThreshold) {
        if (!ultimateOwners.has(owner.ownerId)) {
          ultimateOwners.set(owner.ownerId, {
            id: owner.ownerId,
            directStake: owner.stake,
            cumulativeStake: cumulativeStake * 100,
            chain: owner.chain
          });
        } else {
          const existing = ultimateOwners.get(owner.ownerId);
          if (cumulativeStake * 100 > existing.cumulativeStake) {
            ultimateOwners.set(owner.ownerId, {
              id: owner.ownerId,
              directStake: owner.stake,
              cumulativeStake: cumulativeStake * 100,
              chain: owner.chain
            });
          }
        }
      }
    });

    return Array.from(ultimateOwners.values());
  }

  analyzeShellCompanyRisk(companyId) {
    const cacheKey = `shell_risk_${companyId}`;
    if (this.riskCache.has(cacheKey)) {
      return this.riskCache.get(cacheKey);
    }

    const company = this.nodes.get(companyId);
    if (!company) {
      return { error: 'Company not found' };
    }

    const indicators = {
      CRITICAL: [],
      HIGH: [],
      MEDIUM: [],
      LOW: []
    };

    if (company.registrationDate) {
      const regDate = new Date(company.registrationDate);
      const daysSinceReg = (Date.now() - regDate.getTime()) / (1000 * 60 * 60 * 24);
      if (daysSinceReg < 365) {
        indicators.MEDIUM.push({
          code: 'RECENT_REG',
          message: `Company registered only ${Math.floor(daysSinceReg)} days ago`,
          flag: daysSinceReg < 90 ? 'HIGH_RISK' : 'MEDIUM_RISK'
        });
      }
    }


    if (!company.directors || company.directors.length === 0) {
      indicators.CRITICAL.push({
        code: 'NO_DIRECTORS',
        message: 'No directors found in company records',
        flag: 'SHELL_COMPANY_INDICATOR'
      });
    } else if (company.directors.length === 1) {
      indicators.HIGH.push({
        code: 'SINGLE_DIRECTOR',
        message: 'Only one director for company',
        flag: 'SHELL_COMPANY_INDICATOR'
      });
    }

    if (!company.turnover || company.turnover === 0) {
      indicators.CRITICAL.push({
        code: 'NO_TURNOVER',
        message: 'No turnover reported despite registration',
        flag: 'SHELL_COMPANY_INDICATOR'
      });
    } else if (company.turnover < 100000) {
      indicators.HIGH.push({
        code: 'MINIMAL_TURNOVER',
        message: `Very low turnover: ₹${(company.turnover / 100000).toFixed(1)}L`,
        flag: 'SHELL_COMPANY_INDICATOR'
      });
    }


    if (!company.employeeCount || company.employeeCount === 0) {
      indicators.HIGH.push({
        code: 'NO_EMPLOYEES',
        message: 'No employees reported',
        flag: 'SHELL_COMPANY_INDICATOR'
      });
    } else if (company.turnover > 0) {
      const turnoverPerEmployee = company.turnover / company.employeeCount;
      if (turnoverPerEmployee > 50000000) { 
        indicators.MEDIUM.push({
          code: 'EXTREME_TURNOVER_RATIO',
          message: `Turnover per employee: ₹${(turnoverPerEmployee / 10000000).toFixed(1)}Cr (unusually high)`,
          flag: 'ANOMALY'
        });
      }
    }


    if (company.lastFilingDate) {
      const lastFilingDate = new Date(company.lastFilingDate);
      const daysSinceFiling = (Date.now() - lastFilingDate.getTime()) / (1000 * 60 * 60 * 24);
      if (daysSinceFiling > 365) {
        indicators.HIGH.push({
          code: 'STALE_FILINGS',
          message: `Last filing over ${Math.floor(daysSinceFiling)} days ago`,
          flag: 'SHELL_COMPANY_INDICATOR'
        });
      }
    }


    const sharedDirectors = this.findCommonDirectors(companyId);
    if (sharedDirectors.length > 0) {
      indicators.MEDIUM.push({
        code: 'SHARED_DIRECTORS',
        message: `${sharedDirectors.length} directors shared with other companies`,
        sharedWith: sharedDirectors
      });
    }


    const owners = this.findOwners(companyId, 3);
    if (owners.length > 5) {
      indicators.MEDIUM.push({
        code: 'COMPLEX_OWNERSHIP',
        message: `${owners.length} ownership paths detected (unusually complex)`,
        ownershipDepth: Math.max(...owners.map(o => o.depth))
      });
    }


    const hasCircular = this.detectCircularOwnership(companyId);
    if (hasCircular) {
      indicators.CRITICAL.push({
        code: 'CIRCULAR_OWNERSHIP',
        message: 'Circular ownership detected - potential shell company network',
        cicle: hasCircular
      });
    }

    const criticalCount = indicators.CRITICAL.length;
    const highCount = indicators.HIGH.length;
    const mediumCount = indicators.MEDIUM.length;

    let shellProbability = 0;
    shellProbability += criticalCount * 40;  
    shellProbability += highCount * 20;      
    shellProbability += mediumCount * 5;     
    shellProbability = Math.min(shellProbability, 100);

    const risk = {
      companyId,
      shellCompanyProbability: shellProbability,
      riskLevel: shellProbability > 70 ? 'CRITICAL' : shellProbability > 40 ? 'HIGH' : 'MEDIUM',
      indicators,
      summary: {
        critical: criticalCount,
        high: highCount,
        medium: mediumCount,
        low: indicators.LOW.length
      },
      analysis: {
        businessActivity: company.businessActivity || 'Not specified',
        registrationAge: company.registrationDate ? 
          Math.floor((Date.now() - new Date(company.registrationDate).getTime()) / (1000 * 60 * 60 * 24)) + ' days' : 
          'Unknown',
        directorCount: company.directors.length,
        turnover: company.turnover,
        employees: company.employeeCount
      },
      timestamp: new Date().toISOString()
    };

    this.riskCache.set(cacheKey, risk);
    return risk;
  }


  findCommonDirectors(companyId) {
    const company = this.nodes.get(companyId);
    if (!company || !company.directors) return [];

    const commonDirectors = [];
    const companyDirectors = new Set(company.directors.map(d => d.id || d.toLowerCase()));

    for (const [otherId, otherCompany] of this.nodes.entries()) {
      if (otherId === companyId || !otherCompany.directors) continue;

      const otherDirs = new Set(otherCompany.directors.map(d => d.id || d.toLowerCase()));
      const intersection = [...companyDirectors].filter(d => otherDirs.has(d));

      if (intersection.length > 0) {
        commonDirectors.push({
          companyId: otherId,
          companyName: otherCompany.name,
          sharedDirectors: intersection
        });
      }
    }

    return commonDirectors;
  }

  
  detectCircularOwnership(companyId) {
    const visited = new Set();
    const recursionStack = new Set();

    const hasCycle = (nodeId, path) => {
      visited.add(nodeId);
      recursionStack.add(nodeId);
      path.push(nodeId);

      // Check outgoing edges (ownership)
      for (const [edgeKey, edge] of this.edges.entries()) {
        if (edge.from === nodeId && edge.type === 'OWNERSHIP') {
          if (!visited.has(edge.to)) {
            if (hasCycle(edge.to, [...path])) {
              return true;
            }
          } else if (recursionStack.has(edge.to)) {
            return path;
          }
        }
      }

      recursionStack.delete(nodeId);
      return null;
    };

    const cycle = hasCycle(companyId, []);
    return cycle && Array.isArray(cycle) ? cycle : null;
  }

  
  detectCompanyNetworks() {
    const visited = new Set();
    const networks = [];

    const dfs = (nodeId, network) => {
      if (visited.has(nodeId)) return;
      visited.add(nodeId);
      network.add(nodeId);

      for (const [edgeKey, edge] of this.edges.entries()) {
        if (edge.type === 'OWNERSHIP') {
          if (edge.from === nodeId && !visited.has(edge.to)) {
            dfs(edge.to, network);
          }
          if (edge.to === nodeId && !visited.has(edge.from)) {
            dfs(edge.from, network);
          }
        }
      }
    };

    for (const [companyId] of this.nodes.entries()) {
      if (!visited.has(companyId)) {
        const network = new Set();
        dfs(companyId, network);
        if (network.size > 1) {
          networks.push({
            companies: Array.from(network),
            size: network.size,
            details: Array.from(network).map(id => ({
              id,
              name: this.nodes.get(id).name
            }))
          });
        }
      }
    }

    return networks;
  }

  
  generateGraphReport(companyId) {
    const company = this.nodes.get(companyId);
    if (!company) return { error: 'Company not found' };

    const owners = this.detectUltimateBeneficialOwners(companyId);
    const subsidiaries = this.findSubsidiaries(companyId);
    const shellRisk = this.analyzeShellCompanyRisk(companyId);
    const networks = this.detectCompanyNetworks();
    const companyNetwork = networks.find(n => n.companies.includes(companyId));

    return {
      company: {
        id: companyId,
        name: company.name,
        pan: company.pan,
        directors: company.directors
      },
      ownership: {
        ultimateBeneficialOwners: owners,
        directOwners: this.findOwners(companyId, 1),
        subsidiaries,
        networks: companyNetwork ? companyNetwork.companies.length : 1
      },
      risks: {
        shellCompanyAnalysis: shellRisk,
        commonDirectors: this.findCommonDirectors(companyId),
        circularOwnership: this.detectCircularOwnership(companyId)
      },
      statistics: {
        totalNodes: this.nodes.size,
        totalRelationships: this.edges.size
      },
      timestamp: new Date().toISOString()
    };
  }

  
  exportForVisualization() {
    const nodes = Array.from(this.nodes.values()).map(node => ({
      id: node.id,
      label: node.name,
      title: `${node.name}\nPAN: ${node.pan || 'N/A'}`,
      size: 30,
      group: node.businessActivity || 'Other'
    }));

    const edges = Array.from(this.edges.values()).map(edge => ({
      from: edge.from,
      to: edge.to,
      label: `${edge.stake}%`,
      arrows: 'to',
      title: `${edge.type}: ${edge.stake}% stake`
    }));

    return { nodes, edges };
  }


  exportGraphData() {
    return {
      nodes: Array.from(this.nodes.entries()).map(([id, data]) => [id, data]),
      edges: Array.from(this.edges.entries()).map(([key, data]) => [key, data]),
      timestamp: new Date().toISOString()
    };
  }


  importGraphData(data) {
    this.nodes.clear();
    this.edges.clear();
    this.riskCache.clear();

    data.nodes.forEach(([id, nodeData]) => {
      this.nodes.set(id, nodeData);
    });

    data.edges.forEach(([key, edgeData]) => {
      this.edges.set(key, edgeData);
    });
  }

  clear() {

    this.edges.clear();
    this.riskCache.clear();
  }
}

export default new OwnershipGraph();
