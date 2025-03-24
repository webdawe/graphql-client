import { useParams } from "react-router";
import { getCompany } from "../lib/graphql/queries";
import { useEffect, useState } from "react";
import JobList from "../components/JobList";

function CompanyPage() {
  const { companyId } = useParams();
  const [state, setState] = useState({
    company: null,
    loading: true,
    error: false,
  });
  useEffect(() => {
    async function fetchCompany() {
      try {
        const company = await getCompany(companyId);

        setState({
          company,
          loading: false,
          error: false,
        });
      } catch {
        setState({
          company: null,
          loading: false,
          error: true,
        });
      }
    }
    fetchCompany();
  }, [companyId]);

  const { company, loading, error } = state;
  if (loading) {
    return <div className="loading">loading...</div>;
  }
  if (error) {
    return <div className="has-text-danger">Company Not Found</div>;
  }
  return (
    <>
      {company && (
        <div>
          <h1 className="title">{company.name}</h1>
          <div className="box">{company.description}</div>
          <h2 className="subtitle">Jobs at {company.name}</h2>
          {company.jobs && <JobList jobs={company.jobs} />}
        </div>
      )}
    </>
  );
}

export default CompanyPage;
