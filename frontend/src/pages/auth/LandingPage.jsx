import React, { useState } from "react";
import { useAppContext } from "../../context/AppContext";
import {
  ShieldAlert,
  User,
  Key,
  Mail,
  Lock,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Eye,
  EyeOff,
  UserPlus,
  Globe
} from "lucide-react";
import "./LandingPage.css";

const API_URL = "http://localhost:8081/api/auth";

const LandingPage = () => {

  const { login } = useAppContext();

  // =====================================================
  // PAGE MODE
  // =====================================================

  const [mode, setMode] = useState("login");
  // login | register | verify


  // =====================================================
  // LOGIN STATES
  // =====================================================

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);


  // =====================================================
  // REGISTER STATES
  // =====================================================

  const [registerName, setRegisterName] = useState("");
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");


  // =====================================================
  // OTP
  // =====================================================

  const [otp, setOtp] = useState("");
  const [verificationEmail, setVerificationEmail] = useState("");


  // =====================================================
  // UI STATES
  // =====================================================

  const [showPassword, setShowPassword] = useState(false);
  const [showRegisterPassword, setShowRegisterPassword] =
    useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);


  // =====================================================
  // CLEAR MESSAGES
  // =====================================================

  const clearMessages = () => {
    setError("");
    setSuccess("");
  };


  // =====================================================
  // LOGIN
  // =====================================================

  const handleLoginSubmit = async (e) => {

    e.preventDefault();

    clearMessages();
    setLoading(true);

    try {

      const response = await fetch(
        `${API_URL}/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            email,
            password
          })
        }
      );

      const data = await response.json().catch(() => null);

      if (!response.ok) {

        const message = data || "Login failed.";

        if (message === "EMAIL_NOT_VERIFIED") {

          setVerificationEmail(email);
          setMode("verify");

          setError(
            "Please verify your email before signing in."
          );

        } else if (message === "INVALID_PASSWORD") {

          setError("Invalid email or password.");

        } else if (message === "USER_NOT_FOUND") {

          setError("No account found with this email.");

        } else {

          setError(
            typeof message === "string"
              ? message
              : "Login failed."
          );
        }

        return;
      }


      // =================================================
      // EXISTING LOGIN LOGIC
      // =================================================

      const role = data.role;

      const workerId =
        data.workerId ||
        data.id ||
        data.userId;

      const userData = {

        email: email,

        name:
          data.workerName ||
          email.split("@")[0],

        role,

        workerId,

        teamId:
          data.teamId,

        teamName:
          data.teamName
      };


      if (rememberMe) {

        localStorage.setItem(
          "token",
          data.token
        );

        localStorage.setItem(
          "role",
          role
        );

        localStorage.setItem(
          "email",
          email
        );

        localStorage.setItem(
          "user",
          JSON.stringify(userData)
        );

      } else {

        sessionStorage.setItem(
          "token",
          data.token
        );

        sessionStorage.setItem(
          "role",
          role
        );

        sessionStorage.setItem(
          "email",
          email
        );

        sessionStorage.setItem(
          "user",
          JSON.stringify(userData)
        );
      }


      login(
        role,
        email.split("@")[0],
        userData
      );

    } catch (err) {

      console.error(err);

      setError(
        "Unable to connect to authentication server."
      );

    } finally {

      setLoading(false);
    }
  };


  // =====================================================
  // REGISTER
  // =====================================================

  const handleRegisterSubmit = async (e) => {

    e.preventDefault();

    clearMessages();


    // Password validation

    if (registerPassword.length < 8) {

      setError(
        "Password must contain at least 8 characters."
      );

      return;
    }


    if (
      registerPassword !==
      confirmPassword
    ) {

      setError(
        "Passwords do not match."
      );

      return;
    }


    setLoading(true);

    try {

      const response = await fetch(
        `${API_URL}/register`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            name: registerName,
            email: registerEmail,
            password: registerPassword
          })
        }
      );


      const data =
        await response.text();


      if (!response.ok) {

        if (
          data ===
          "EMAIL_ALREADY_REGISTERED"
        ) {

          setError(
            "This email is already registered."
          );

        } else {

          setError(
            data ||
            "Registration failed."
          );
        }

        return;
      }


      // =================================================
      // MOVE TO OTP SCREEN
      // =================================================

      setVerificationEmail(
        registerEmail
      );

      setOtp("");

      setSuccess(
        "Account created successfully. OTP has been sent to your email."
      );

      setMode("verify");

    } catch (err) {

      console.error(err);

      setError(
        "Unable to connect to authentication server."
      );

    } finally {

      setLoading(false);
    }
  };


  // =====================================================
  // VERIFY OTP
  // =====================================================

  const handleVerifyOtp = async (e) => {

    e.preventDefault();

    clearMessages();


    if (otp.length !== 6) {

      setError(
        "Please enter the 6-digit OTP."
      );

      return;
    }


    setLoading(true);

    try {

      const response = await fetch(
        `${API_URL}/verify-email`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            email: verificationEmail,
            otp: otp
          })
        }
      );


      const data =
        await response.text();


      if (!response.ok) {

        if (
          data === "INVALID_OTP"
        ) {

          setError(
            "Incorrect OTP. Please try again."
          );

        } else if (
          data === "OTP_EXPIRED"
        ) {

          setError(
            "OTP has expired. Please request a new OTP."
          );

        } else {

          setError(
            data ||
            "Email verification failed."
          );
        }

        return;
      }


      // =================================================
      // VERIFICATION SUCCESS
      // =================================================

      setSuccess(
        "Email verified successfully. You can now sign in."
      );

      setEmail(
        verificationEmail
      );

      setPassword("");

      setTimeout(() => {

        setMode("login");

        setSuccess("");

      }, 1500);

    } catch (err) {

      console.error(err);

      setError(
        "Unable to connect to authentication server."
      );

    } finally {

      setLoading(false);
    }
  };


  // =====================================================
  // GOOGLE LOGIN
  // =====================================================

  const handleGoogleLogin = () => {

    setError("");

    /*
     * Google authentication will be connected here.
     *
     * The backend endpoint will be:
     *
     * POST /api/auth/google
     *
     * We are keeping this button ready now.
     */

    setError(
      "Google authentication will be connected next."
    );
  };


  // =====================================================
  // SWITCH MODE
  // =====================================================

  const openRegister = () => {

    clearMessages();

    setMode("register");

  };


  const openLogin = () => {

    clearMessages();

    setMode("login");

  };


  const openVerify = () => {

    clearMessages();

    setMode("verify");

  };


  // =====================================================
  // LOGIN PAGE
  // =====================================================

  const renderLogin = () => (

    <>

      <form
        onSubmit={handleLoginSubmit}
        className="auth-form"
      >

        {/* EMAIL */}

        <div className="input-group">

          <span className="input-label">
            EMAIL ADDRESS
          </span>

          <div className="input-with-icon">

            <User
              size={17}
              className="field-icon"
            />

            <input
              type="email"
              value={email}
              onChange={(e) => {

                setEmail(e.target.value);
                clearMessages();

              }}
              placeholder="Enter your registered email"
              className="input-control"
              required
            />

          </div>

        </div>


        {/* PASSWORD */}

        <div className="input-group">

          <span className="input-label">
            PASSWORD
          </span>

          <div className="input-with-icon">

            <Key
              size={17}
              className="field-icon"
            />

            <input
              type={
                showPassword
                  ? "text"
                  : "password"
              }
              value={password}
              onChange={(e) => {

                setPassword(e.target.value);
                clearMessages();

              }}
              placeholder="Enter password"
              className="input-control"
              required
            />

            <button
              type="button"
              className="password-toggle"
              onClick={() =>
                setShowPassword(
                  !showPassword
                )
              }
            >

              {showPassword ? (
                <EyeOff size={16} />
              ) : (
                <Eye size={16} />
              )}

            </button>

          </div>

        </div>


        {/* REMEMBER */}

        <div className="form-row-flex">

          <label className="checkbox-label">

            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) =>
                setRememberMe(
                  e.target.checked
                )
              }
            />

            <span>
              Remember session
            </span>

          </label>


          <button
            type="button"
            className="forgot-link"
          >
            Forgot Password?
          </button>

        </div>


        {/* ERROR */}

        {error && (

          <div className="login-error">
            {error}
          </div>

        )}


        {/* SUCCESS */}

        {success && (

          <div className="login-success">
            <CheckCircle2 size={16} />
            <span>{success}</span>
          </div>

        )}


        {/* SIGN IN */}

        <button
          type="submit"
          className="btn-primary login-btn"
          disabled={loading}
        >

          <span>
            {loading
              ? "Signing In..."
              : "Sign In"}
          </span>

          {!loading && (
            <ArrowRight size={17} />
          )}

        </button>

      </form>


      {/* DIVIDER */}

      <div className="auth-divider">

        <span></span>

        <p>OR</p>

        <span></span>

      </div>


      {/* GOOGLE */}

      <button
        type="button"
        className="google-btn"
        onClick={handleGoogleLogin}
      >

        <Globe size={18} />

        <span>
          Continue with Google
        </span>

      </button>


      {/* CREATE ACCOUNT */}

      <div className="create-account">

        <span>
          Don't have an account?
        </span>

        <button
          type="button"
          onClick={openRegister}
        >
          Create Account
          <UserPlus size={15} />
        </button>

      </div>

    </>
  );


  // =====================================================
  // REGISTER PAGE
  // =====================================================

  const renderRegister = () => (

    <>

      <div className="register-heading">

        <h2>
          Create Account
        </h2>

        <p>
          Create your RESQMESH user account
          to access the platform.
        </p>

      </div>


      <form
        onSubmit={handleRegisterSubmit}
        className="auth-form"
      >

        {/* NAME */}

        <div className="input-group">

          <span className="input-label">
            FULL NAME
          </span>

          <div className="input-with-icon">

            <User
              size={17}
              className="field-icon"
            />

            <input
              type="text"
              value={registerName}
              onChange={(e) =>
                setRegisterName(
                  e.target.value
                )
              }
              placeholder="Enter your full name"
              className="input-control"
              required
            />

          </div>

        </div>


        {/* EMAIL */}

        <div className="input-group">

          <span className="input-label">
            EMAIL ADDRESS
          </span>

          <div className="input-with-icon">

            <Mail
              size={17}
              className="field-icon"
            />

            <input
              type="email"
              value={registerEmail}
              onChange={(e) =>
                setRegisterEmail(
                  e.target.value
                )
              }
              placeholder="Enter your email"
              className="input-control"
              required
            />

          </div>

        </div>


        {/* PASSWORD */}

        <div className="input-group">

          <span className="input-label">
            PASSWORD
          </span>

          <div className="input-with-icon">

            <Lock
              size={17}
              className="field-icon"
            />

            <input
              type={
                showRegisterPassword
                  ? "text"
                  : "password"
              }
              value={registerPassword}
              onChange={(e) =>
                setRegisterPassword(
                  e.target.value
                )
              }
              placeholder="Minimum 8 characters"
              className="input-control"
              required
            />

            <button
              type="button"
              className="password-toggle"
              onClick={() =>
                setShowRegisterPassword(
                  !showRegisterPassword
                )
              }
            >

              {showRegisterPassword ? (
                <EyeOff size={16} />
              ) : (
                <Eye size={16} />
              )}

            </button>

          </div>

        </div>


        {/* CONFIRM PASSWORD */}

        <div className="input-group">

          <span className="input-label">
            CONFIRM PASSWORD
          </span>

          <div className="input-with-icon">

            <Lock
              size={17}
              className="field-icon"
            />

            <input
              type="password"
              value={confirmPassword}
              onChange={(e) =>
                setConfirmPassword(
                  e.target.value
                )
              }
              placeholder="Confirm your password"
              className="input-control"
              required
            />

          </div>

        </div>


        {/* ERROR */}

        {error && (

          <div className="login-error">
            {error}
          </div>

        )}


        {/* REGISTER */}

        <button
          type="submit"
          className="btn-primary login-btn"
          disabled={loading}
        >

          <span>
            {loading
              ? "Creating Account..."
              : "Create Account"}
          </span>

          {!loading && (
            <UserPlus size={17} />
          )}

        </button>

      </form>


      {/* BACK TO LOGIN */}

      <button
        type="button"
        className="back-login-btn"
        onClick={openLogin}
      >

        <ArrowLeft size={16} />

        <span>
          Back to Sign In
        </span>

      </button>

    </>
  );


  // =====================================================
  // VERIFY OTP PAGE
  // =====================================================

  const renderVerify = () => (

    <>

      <div className="verify-icon">

        <Mail size={25} />

      </div>


      <div className="register-heading">

        <h2>
          Verify Your Email
        </h2>

        <p>
          We sent a 6-digit verification code
          to
        </p>

        <strong>
          {verificationEmail}
        </strong>

      </div>


      <form
        onSubmit={handleVerifyOtp}
        className="auth-form"
      >

        <div className="input-group">

          <span className="input-label">
            VERIFICATION CODE
          </span>

          <div className="input-with-icon">

            <Lock
              size={17}
              className="field-icon"
            />

            <input
              type="text"
              inputMode="numeric"
              maxLength={6}
              value={otp}
              onChange={(e) => {

                const value =
                  e.target.value
                    .replace(/\D/g, "")
                    .slice(0, 6);

                setOtp(value);

                clearMessages();

              }}
              placeholder="Enter 6-digit OTP"
              className="input-control otp-input"
              required
            />

          </div>

        </div>


        {/* ERROR */}

        {error && (

          <div className="login-error">
            {error}
          </div>

        )}


        {/* SUCCESS */}

        {success && (

          <div className="login-success">

            <CheckCircle2 size={16} />

            <span>
              {success}
            </span>

          </div>

        )}


        <button
          type="submit"
          className="btn-primary login-btn"
          disabled={loading}
        >

          <span>
            {loading
              ? "Verifying..."
              : "Verify Email"}
          </span>

          {!loading && (
            <CheckCircle2 size={17} />
          )}

        </button>

      </form>


      <div className="verify-help">

        <span>
          Didn't receive the OTP?
        </span>

        <button
          type="button"
          onClick={() => {
            setError(
              "Resend OTP will be connected next."
            );
          }}
        >
          Resend OTP
        </button>

      </div>


      <button
        type="button"
        className="back-login-btn"
        onClick={openLogin}
      >

        <ArrowLeft size={16} />

        <span>
          Back to Sign In
        </span>

      </button>

    </>
  );


  // =====================================================
  // MAIN UI
  // =====================================================

  return (

    <div className="landing-page">

      <div className="auth-background-grid"></div>


      <div className="auth-container">


        {/* LEFT BRANDING */}

        <div className="brand-section">

          <div className="brand-logo">

            <div className="logo-box">

              <ShieldAlert
                size={30}
                strokeWidth={2.2}
              />

            </div>

            <div>

              <div className="brand-name">
                RESQMESH
              </div>

              <div className="brand-subtitle">
                EMERGENCY COMMUNICATION NETWORK
              </div>

            </div>

          </div>


          <div className="brand-content">

            <span className="status-badge">
              <span className="status-dot"></span>
              SYSTEM ONLINE
            </span>

            <h1>
              Emergency
              <br />
              <span>Communication</span>
              <br />
              Without Limits.
            </h1>

            <p>
              A resilient communication platform
              designed for emergency response
              when conventional networks are
              unavailable.
            </p>

          </div>


          <div className="telemetry-box">

            <div className="telemetry-title">
              SYSTEM TELEMETRY
            </div>

            <div className="telemetry-row">

              <span>
                NETWORK
              </span>

              <strong>
                ONLINE
              </strong>

            </div>

            <div className="telemetry-row">

              <span>
                MESH NODES
              </span>

              <strong>
                ACTIVE
              </strong>

            </div>

            <div className="telemetry-row">

              <span>
                SECURE LINK
              </span>

              <strong>
                ENCRYPTED
              </strong>

            </div>

          </div>

        </div>


        {/* RIGHT AUTH CARD */}

        <div className="auth-card">

          <div className="auth-card-inner">


            {/* HEADER */}

            <div className="auth-header">

              {mode === "login" && (

                <>
                  <span className="auth-kicker">
                    SECURE ACCESS
                  </span>

                  <h2>
                    Sign In
                  </h2>

                  <p>
                    Access the RESQMESH command
                    platform
                  </p>
                </>

              )}


              {mode === "register" && (

                <>
                  <span className="auth-kicker">
                    NEW USER
                  </span>

                  <h2>
                    Create Account
                  </h2>

                  <p>
                    Register for secure RESQMESH
                    access
                  </p>
                </>

              )}


              {mode === "verify" && (

                <>
                  <span className="auth-kicker">
                    EMAIL VERIFICATION
                  </span>

                  <h2>
                    Verify Account
                  </h2>

                  <p>
                    Complete email verification
                  </p>
                </>

              )}

            </div>


            {/* CONTENT */}

            {mode === "login" &&
              renderLogin()}

            {mode === "register" &&
              renderRegister()}

            {mode === "verify" &&
              renderVerify()}


            {/* FOOTER */}

            <div className="system-footer">

              <span>
                SECURE GATEWAY
              </span>

              <span>
                RESQMESH
              </span>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
};

export default LandingPage;