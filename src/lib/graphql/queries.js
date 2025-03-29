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

export const appoloClient = new ApolloClient({
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

export const jobsQuery = gql`
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
export const jobByIdQuery = gql`
  query jobById($id: ID!) {
    job(id: $id) {
      ...JobDetail
    }
  }
  ${jobDetailFragment}
`;

export const companyByIdQuery = gql`
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

export const createJobMutation = gql`
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
