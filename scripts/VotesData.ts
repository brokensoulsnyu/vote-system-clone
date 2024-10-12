// VotesData.ts

export interface VoteOption {
    imageSrc: string;
    name: string;
    description: string;
    youtubeLink: string;
    facebookLink: string;
}

export const voteOptions: VoteOption[] = [
    {
      imageSrc: "@/app/assets/images/Islam Mohamed.jpg",
      name: "Islam Mohamed",
      description: "بلوجر",
      youtubeLink: "",
      facebookLink: "https://www.facebook.com/dr.islammohamed.md/?locale=ar_AR"
    }
];
