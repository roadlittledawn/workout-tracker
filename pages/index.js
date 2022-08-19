export default function Home() {
  const domain = process.env.DOMAIN || "localhost";
  const port = process.env.PORT ? `:${process.env.PORT}` : `:3000`;
  return (
    <ul>
      <li>
        <a
          href={`https://www.strava.com/oauth/authorize/?client_id=43581&redirect_uri=http://${domain}${port}/token&response_type=code&scope=read,read_all,activity%3Aread,activity%3Aread_all`}
        >
          Login
        </a>
      </li>
    </ul>
  );
}
