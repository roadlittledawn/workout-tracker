import styles from "../styles/LoginButton.module.scss";

const SIZE = {
  ["lg"]: "sizeLarge",
  ["sm"]: "sizeSmall",
};

const LoginButton = ({ children, href, size }) => {
  return (
    <a className={`${styles.loginButton} ${styles[SIZE[size]]}`} href={href}>
      {children}
    </a>
  );
};

export default LoginButton;
