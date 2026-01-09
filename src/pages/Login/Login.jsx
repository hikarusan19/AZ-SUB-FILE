import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../../context/AppContext";
import LeftImage from "../../assets/1.png";
import LogoImage from "../../assets/2.png";
import "./Login.css";
import supabase from "../../config/supabaseClient";

function Login() {
  const navigate = useNavigate();
  const { setUserRole, setCurrentUser } = useApp();

  useEffect(() => {
    document.body.classList.add("login-page");
    return () => {
      document.body.classList.remove("login-page");
    };
  }, []);

  const [identifier, setIdentifier] = useState(""); // email or username
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    let email = identifier;

    // If the identifier is not an email, look it up as username
    if (!identifier.includes("@")) {
      const { data, error: fetchError } = await supabase
        .from("profiles")
        .select("email")
        .eq("username", identifier)
        .single();

      if (fetchError || !data?.email) {
        setError("Username not found");
        return;
      }

      email = data.email;
    }

    // Sign in with email and password
    const { data, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      setError(signInError.message);
      return;
    }

    const user = data.user;
    if (!user) {
      setError("Login failed. Try again.");
      return;
    }

    // Fetch the latest account_type from profiles table (not user_metadata)
    const { data: profileData, error: profileError } = await supabase
      .from("profiles")
      .select("account_type, id, username, first_name, last_name")
      .eq("id", user.id)
      .single();

    if (profileError || !profileData) {
      setError("Could not fetch user profile.");
      return;
    }

    const accountType = profileData.account_type?.toLowerCase();

    // Set user role in context
    setUserRole(accountType?.toUpperCase());

    // Set current user with real data from database
    setCurrentUser({
      id: profileData.id,
      username: profileData.username,
      name: `${profileData.first_name || ''} ${profileData.last_name || ''}`.trim() || profileData.username,
      firstName: profileData.first_name,
      lastName: profileData.last_name,
      email: user.email,
      role: accountType?.toUpperCase()
    });

    switch (accountType) {
      case "admin":
        navigate("/admin/dashboard");
        break;
      case "al":
        navigate("/al/dashboard");
        break;
      case "ap":
        navigate("/ap/dashboard");
        break;
      case "mp":
        navigate("/mp/dashboard");
        break;
      case "md":
        navigate("/md/dashboard");
        break;
      default:
        setError("Unknown account type.");
    }
  };

  return (
    <div className="login-wrapper">
      <div className="login-container">
        <div className="login-left-panel">
          <img src={LeftImage} alt="Insurance Image" />
          <h2>Explore Our Insurance Solutions</h2>
          <p>
            At Caelum, we offer insurance plans in the Philippines to address Filipinos' most common financial needs. Whatever your financial need, we are with you in your journey to a more secure tomorrow.
          </p>
        </div>

        <div className="login-right-panel">
          <img src={LogoImage} alt="Allianz Logo" className="logo" />
          <p className="description">
            Everything you need to know about your Caelum policy
          </p>

          <h2 className="signin-prompt">SIGN IN</h2>

          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label className="form-label">Username or Email</label>
              <input
                type="text"
                className="form-input"
                placeholder="Enter your username or email"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                type="password"
                className="form-input"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {error && <p className="error-text">{error}</p>}

            <button type="submit" className="signin-button">
              SIGN IN
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Login;
