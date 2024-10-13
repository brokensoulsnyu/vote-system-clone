import { useState } from "react";
import Card from "@/app/components/VoteCard";
import AdvertCard from "@/app/components/AdvertCard";
import { voteOptions } from "@/VoteeData";
import Image from "next/image";
import logo from "@/public/Images/thebest.png";
import "@/app/assets/Styles/Card.css";
import "@/app/assets/Styles/Navbar.css";
import "@/app/assets/Styles/background-styles.css";

type Page = "vote" | "results";

export default function VotingPage() {
  const [message, setMessage] = useState("");
  const [cooldownMinutes, setCooldownMinutes] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState<Page>("vote");

  const handleVote = async (optionName: string) => {
    try {
      setMessage("");
      const response = await fetch("/api/vote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ option: optionName }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(data.message);
        setCooldownMinutes(null);
      } else {
        setMessage(data.message);
        if (data.cooldownRemaining) {
          setCooldownMinutes(data.cooldownRemaining);
        }
      }
    } catch (error) {
      setMessage("Error casting vote. Please try again.");
      console.error("Voting error:", error);
    }
  };

  const VoteContent = () => (
    <>
      {message && (
        <p
          className={`message ${
            cooldownMinutes !== null ? "cooldown" : "error"
          }`}
        >
          {message}
        </p>
      )}
      {cooldownMinutes !== null && (
        <p className="message cooldown">
          You can vote again in approximately {cooldownMinutes / 60} hrs.
        </p>
      )}
      <div className="card-grid">
        {voteOptions.map((option, index) => (
          <Card
            key={index}
            imageSrc={`Images/${option.imageSrc}`}
            name={option.name}
            description={option.description}
            youtubeLink={option.youtubeLink}
            facebookLink={option.facebookLink}
            onClick={() => handleVote(option.name)}
          />
        ))}
      </div>
    </>
  );

  return (
    <div className="container">
      <div className="background-container">
        {[...Array(20)].map((_, index) => (
          <div
            key={index}
            className={`background-line background-line-${index + 1}`}
          />
        ))}
      </div>

      <nav className="navbar">
        <button
          className={`nav-link ${currentPage === "vote" ? "active" : ""}`}
          onClick={() => setCurrentPage("vote")}
        >
          Vote
        </button>
      </nav>

      <div className="logo-container">
        <Image
          className="logo"
          src={logo}
          alt="Logo"
          width={300}
          height={300}
          priority
        />
        <AdvertCard />
      </div>

      <VoteContent />
    </div>
  );
}