import { Footer } from "@/components/footer";
import { Header } from "@/components/header";

export default function Page() {
  return (
    <div className="flex flex-col">
      <Header />
      <main className="typeset mx-auto max-w-md">
        <h1>Privacy Policy</h1>
        <p>Last updated: September 7, 2026</p>
        <p>
          cuGuessr ("we", "us", or "our") is a daily campus guessing game. This
          Privacy Policy explains what information we collect and how we use it.
        </p>
        <h2>Information We Collect</h2>
        <h3>Accounts</h3>
        <p>
          You can play cuGuessr without signing up. When you play anonymously,
          we create an anonymous account so that your gameplay and scores can be
          saved.
        </p>
        <p>
          If you create a registered account, we collect the information
          necessary to manage your account, such as your email address and
          username.
        </p>
        <h3>Game Data</h3>
        <p>
          We store information about your gameplay, including scores, guesses,
          game dates, and related gameplay information. This information may be
          associated with your account.
        </p>
        <p>
          Your username and scores may be publicly displayed on cuGuessr
          leaderboards.
        </p>
        <h3>User-Submitted Content</h3>
        <p>
          Users may submit photos for consideration in cuGuessr and report
          photos that they believe are inappropriate, inaccurate, or otherwise
          problematic.
        </p>
        <p>
          Photos and reports may be associated with the account used to submit
          them. Photos submitted to cuGuessr may be used in the game and
          displayed to other players.
        </p>
        <h2>How We Use Your Information</h2>
        <p>We use the information we collect to:</p>
        <ul>
          <li>Provide and operate cuGuessr.</li>
          <li>Manage user accounts and authentication.</li>
          <li>Save scores and gameplay history.</li>
          <li>Operate leaderboards and game statistics.</li>
          <li>Review and manage submitted photos and reports.</li>
          <li>Prevent abuse and maintain the security of the service.</li>
          <li>Maintain and improve cuGuessr.</li>
        </ul>
        <p>We do not sell your personal information.</p>
        <h2>Third-Party Services</h2>
        <p>
          We use third-party services to host, store, and operate cuGuessr.
          These services may process information on our behalf as necessary to
          provide the service.
        </p>
        <h2>Cookies</h2>
        <p>
          cuGuessr may use cookies or similar technologies necessary for
          authentication, maintaining sessions, security, and operating the
          website.
        </p>
        <h2>Data Retention and Deletion</h2>
        <p>
          We retain account, gameplay, photo submission, and report information
          for as long as necessary to operate cuGuessr and for legitimate
          operational or legal purposes.
        </p>
        <p>
          You may request deletion of your account and associated personal
          information by contacting us at{" "}
          <a href="mailto:support@cuguessr.com">support@cuguessr.com</a>.
        </p>
        <p>
          Some information, such as scores displayed on leaderboards or photos
          submitted to the game, may remain where necessary for the continued
          operation of cuGuessr.
        </p>
        <h2>Changes to This Policy</h2>
        <p>
          We may update this Privacy Policy from time to time. Changes will be
          posted on this page with an updated "Last updated" date.
        </p>
        <h2>Contact</h2>
        <p>
          If you have questions about this Privacy Policy or want to request
          deletion of your information, contact us at:
        </p>
        <a href="mailto:support@cuguessr.com">support@cuguessr.com</a>
      </main>
      <Footer />
    </div>
  );
}
