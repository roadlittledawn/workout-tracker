import styles from "../styles/LoginButton.module.scss";

const SIZE = {
  ["lg"]: "sizeLarge",
  ["default"]: "sizeDefault",
  ["sm"]: "sizeSmall",
};

const LoginButton = ({ children, size, envVars }) => {
  const { NODE_ENV, HOSTNAME, CLIENT_ID } = envVars;
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
    <a className={`${styles.loginButton} ${styles[SIZE[size]]}`} href={href}>
      {children}
    </a>
  );
};

export default LoginButton;
