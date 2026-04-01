
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

class AnalysisService {
  /**
   * Analyze financial document for contradictions
   * @param {string} documentText
   * @param {string} documentId
   * @returns {Promise<Object>} contradiction analysis
   */
  async analyzeContradictions(documentText, documentId = null) {
    try {
      const response = await fetch(
        `${API_BASE}/analyze/contradictions${documentId ? `?documentId=${documentId}` : ''}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'text/plain'
          },
          body: documentText
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Contradiction analysis failed:', error);
      throw error;
    }
  }

  /**
   * Analyze company ownership structure
   * @param {string} companyId
   * @param {Object} companyData
   * @param {Object} companyNetwork
   * @returns {Promise<Object>} ownership analysis
   */
  async analyzeOwnership(companyId, companyData, companyNetwork = {}) {
    try {
      const response = await fetch(`${API_BASE}/analyze/ownership`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          companyId,
          companyData,
          companyNetwork
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Ownership analysis failed:', error);
      throw error;
    }
  }

  /**
   * Detect shell company risk
   * @param {string} companyId
   * @param {Object} companyData
   * @returns {Promise<Object>} shell company risk analysis
   */
  async analyzeShellCompanyRisk(companyId, companyData) {
    try {
      const response = await fetch(`${API_BASE}/analyze/shell-company-risk`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          companyId,
          companyData
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Shell company risk analysis failed:', error);
      throw error;
    }
  }

  /**
   * Run full credit assessment with all analyses
   * @param {Object} formData
   * @param {Object} files
   * @param {Object} companyData
   * @returns {Promise<Object>} full assessment result
   */
  async runFullAssessment(formData, files = {}, companyData = {}) {
    try {
      const formPayload = new FormData();
      for (const [key, value] of Object.entries(formData)) {
        if (value !== null && value !== undefined) {
          if (value instanceof File) {
            continue;
          }

          formPayload.append(key, typeof value === 'object' ? JSON.stringify(value) : value);
        }
      }

      formPayload.append('companyData', JSON.stringify(companyData));

      if (files.pnl) {
        formPayload.append('pnl', files.pnl);
      }
      if (files.bank) {
        formPayload.append('bank', files.bank);
      }
      if (files.balanceSheet) {
        formPayload.append('balanceSheet', files.balanceSheet);
      }
      if (files.gst) {
        formPayload.append('gst', files.gst);
      }

      const response = await fetch(`${API_BASE}/assess`, {
        method: 'POST',
        body: formPayload
      });

      if (!response.ok) {
        let message = `HTTP ${response.status}: ${response.statusText}`;

        try {
          const errorPayload = await response.json();
          if (errorPayload?.message) {
            message = errorPayload.message;
          }
        } catch {
          // Keep the fallback HTTP message if the response is not JSON.
        }

        throw new Error(message);
      }

      return await response.json();
    } catch (error) {
      console.error('Full assessment failed:', error);
      throw error;
    }
  }

  /**
   * Get graph visualization data
   * @returns {Promise<Object>} D3-compatible graph data
   */
  async getGraphVisualization() {
    try {
      const response = await fetch(`${API_BASE}/graph/export`);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to fetch graph visualization:', error);
      throw error;
    }
  }

  /**
   * Export graph data for storage
   * @returns {Promise<Object>} serializable graph data
   */
  async exportGraphData() {
    try {
      const response = await fetch(`${API_BASE}/graph/export-data`);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to export graph data:', error);
      throw error;
    }
  }
}

export default new AnalysisService();
