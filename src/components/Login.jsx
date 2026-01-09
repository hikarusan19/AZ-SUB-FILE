import { useState } from "react";
import LeftImage from "../assets/1.png";
import LogoImage from "../assets/2.png";
import './Login.css';

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    const validUsername = "admin@santarosa.edu.ph";
    const validPassword = "qwedcxzas";

    if (username === "" || password === "") {
      alert("Please enter username and password");
      return;
    }

    if (username === validUsername && password === validPassword) {
      window.location.href = "/dashboard";
    } else {
      alert("Invalid username or password");
    }
  };

  return (
    <div className="container">
      {/* Left Panel */}
      <div className="left-panel">
        <img src={LeftImage} alt="Insurance Image" />
        <h2>Explore Our Insurance Solutions</h2>
        <p>
          At Allianz PNB Life, we offer insurance plans in the Philippines to
          address Filipinos' most common financial needs. Whatever your
          financial need, we are with you in your journey to a more secure
          tomorrow.
        </p>
      </div>

      {/* Right Panel */}
      <div className="right-panel">
        <img src={LogoImage} alt="Allianz Logo" className="logo" />
        <p className="description">
          Everything you need to know about your Allianz policy
        </p>
        <h2 className="signin-prompt">SIGN IN</h2>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="username">
              Username
            </label>
            <input
              type="text"
              id="username"
              className="form-input"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password">
              Password
            </label>
            <input
              type="password"
              id="password"
              className="form-input"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <a href="#" className="forgot-password">
            Forgot Password?
          </a>

          <button type="submit" className="signin-button">
            SIGN IN
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;
