import React from "react";
import Link from "next/link";

class Index extends React.Component {
  static getInitialProps({ reduxStore, req }) {
    const isServer = !!req;
    // reduxStore.dispatch(serverRenderClock(isServer))

    return {};
  }

  componentDidMount() {
    // this.timer = startClock(dispatch)
  }

  render() {
    return (
      <div>
        <a href="https://www.strava.com/oauth/authorize/?client_id=43581&redirect_uri=http://localhost:3000/token&response_type=code">
          Login
        </a>
        <Link href="/dashboard">
          <a>Private Dashboard</a>
        </Link>
      </div>
    );
  }
}

export default Index;
