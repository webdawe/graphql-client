import { useParams } from "react-router";
import { companyByIdQuery } from "../lib/graphql/queries";
import JobList from "../components/JobList";
import { useQuery } from "@apollo/client";

function CompanyPage() {
  const { companyId } = useParams();
  const { data, loading, error } = useQuery(companyByIdQuery, {
    variables: { id: companyId },
  });
  let company = null;
  if (loading) {
    return <div className="loading">loading...</div>;
  }
  if (error) {
    return <div className="has-text-danger">Company Not Found</div>;
  }
  if (data) {
    company = data.company;
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
