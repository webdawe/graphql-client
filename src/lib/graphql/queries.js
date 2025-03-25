import { GraphQLClient } from "graphql-request";
import { getAccessToken } from "../auth";
import {
  ApolloClient,
  ApolloLink,
  InMemoryCache,
  concat,
  createHttpLink,
  gql,
} from "@apollo/client";

const httpLink = createHttpLink({ uri: "http://localhost:9000/graphql" });
const customLink = new ApolloLink((operation, forward) => {
  const accessToken = getAccessToken();
  if (accessToken) {
    operation.setContext({
      headers: { Authorization: `Bearer ${accessToken}` },
    });
  }
  //console.log("[customLink] operation:", operation);
  return forward(operation);
});

const appoloClient = new ApolloClient({
  link: concat(customLink, httpLink),
  cache: new InMemoryCache(),
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

  const { data } = await appoloClient.query({
    query,
  });
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
  const { data } = await appoloClient.query({
    query,
    variables: { id },
  });
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
  const { data } = await appoloClient.query({
    query,
    variables: { id },
  });

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

  const { data } = await appoloClient.mutate({
    mutation,
    variables: {
      input: { title, description },
    },
  });

  return data.job;
}
