import React, {useEffect, useState} from "react";

export default function Login() {
  const [loginUrl, setLoginUrl] = useState("");

  useEffect(async () => {
    const result = await fetch("/api/login/google-url");
    const data = await result.json();
    setLoginUrl(data.url);
  })

  return <div>
    <h1>Please login with Google</h1>
    {loginUrl && <a href={loginUrl}>OAuth redirect</a>}
  </div>;
}
