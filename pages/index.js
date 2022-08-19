export default function Home() {
  return (
    <ul>
      <li>
        <a href="https://www.strava.com/oauth/authorize/?client_id=43581&redirect_uri=http://localhost:3000/token&response_type=code&scope=read,read_all,activity%3Aread,activity%3Aread_all">
          Login
        </a>
      </li>
    </ul>
  );
}
