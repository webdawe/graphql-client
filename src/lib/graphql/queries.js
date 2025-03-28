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

  return forward(operation);
});

const appoloClient = new ApolloClient({
  link: concat(customLink, httpLink),
  cache: new InMemoryCache(),
  // defaultOptions: {
  //   query: {
  //     fetchPolicy: "network-only",
  //   },
  //   watchQuery: {
  //     fetchPolicy: "network-only",
  //   },
  // },
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
    fetchPolicy: "cache-first", // policies: cache-first, network-only, cache-only, cache-and-network
  });
  return data.jobs;
}
const jobDetailFragment = gql`
  fragment JobDetail on Job {
    id
    date
    title
    company {
      id
      name
    }
    description
  }
`;
const jobByIdQuery = gql`
  query jobById($id: ID!) {
    job(id: $id) {
      ...JobDetail
    }
  }
  ${jobDetailFragment}
`;
export async function getJob(id) {
  const { data } = await appoloClient.query({
    query: jobByIdQuery,
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

  const { data } = await appoloClient.mutate({
    mutation,
    variables: {
      input: { title, description },
    },
    update: (cache, { data }) => {
      console.log("Inside Cache", data);
      cache.writeQuery({
        query: jobByIdQuery,
        variables: { id: data.job.id },
        data,
      });
    },
  });

  return data.job;
}
