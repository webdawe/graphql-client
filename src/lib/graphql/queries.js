import { GraphQLClient, gql } from "graphql-request";
import { getAccessToken } from "../auth";

const client = new GraphQLClient("http://localhost:9000/graphql", {
  headers: () => {
    const accessToken = getAccessToken();
    if (accessToken) {
      return { Authorization: `Bearer ${accessToken}` };
    }
    return {};
  },
});

export async function getJobs() {
  const query = gql`
    query {
      jobs {
        id
        date
        title
        company {
          id
          name
        }
      }
    }
  `;
  const data = await client.request(query);

  return data.jobs;
}

export async function getJob(id) {
  const query = gql`
    query jobById($id: ID!) {
      job(id: $id) {
        id
        title
        date
        description
        company {
          id
          name
        }
      }
    }
  `;
  const data = await client.request(query, { id });

  return data.job;
}

export async function getCompany(id) {
  const query = gql`
    query companyById($id: ID!) {
      company(id: $id) {
        id
        name
        description
        jobs {
          id
          title
          date
        }
      }
    }
  `;
  const data = await client.request(query, { id });

  return data.company;
}

export async function createJob({ title, description }) {
  const mutation = gql`
    mutation ($input: CreateJobInput!) {
      job: createJob(input: $input) {
        id
      }
    }
  `;
  const { job } = await client.request(mutation, {
    input: { title, description },
  });

  return job;
}
