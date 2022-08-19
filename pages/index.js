export default function Home({ NODE_ENV, HOSTNAME, PORT, CLIENT_ID }) {
  const domain =
    NODE_ENV === "production" ? `https://${HOSTNAME}.com` : `http://localhost`;

  const redirectUrl = new URL("/token", domain);
  redirectUrl.protocol = NODE_ENV === "production" ? "https" : "http";
  redirectUrl.port = NODE_ENV !== "production" ? 3000 : "";

  const href = new URL("/oauth/authorize/", "https://www.strava.com");

  href.searchParams.append("client_id", CLIENT_ID);
  href.searchParams.append("redirect_uri", redirectUrl);
  href.searchParams.append("response_type", "code");
  // href.searchParams.append("approval_prompt", "force");
  href.searchParams.append(
    "scope",
    "read,read_all,activity:read,activity:read_all"
  );

  return (
    <ul>
      <li>
        <a href={href}>Login</a>
      </li>
    </ul>
  );
}

export const getServerSideProps = () => {
  const NODE_ENV = process.env.NODE_ENV;
  const HOSTNAME = process.env.HOSTNAME;
  const PORT = process.env.PORT;
  const CLIENT_ID = process.env.CLIENT_ID;

  return { props: { NODE_ENV, HOSTNAME, PORT, CLIENT_ID } };
};
