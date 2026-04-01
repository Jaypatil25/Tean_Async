import PageBreadcrumb from "../components/common/PageBreadCrumb";
import PageMeta from "../components/common/PageMeta";
import Form from "../Form";

export default function CreditApply() {
  return (
    <>
      <PageMeta
        title="Credit Application | Credit Intelligence"
        description="AI-Powered Corporate Credit Appraisal Application"
      />
      <PageBreadcrumb pageTitle="Credit Application" />
      <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] overflow-hidden">
        <Form />
      </div>
    </>
  );
}
