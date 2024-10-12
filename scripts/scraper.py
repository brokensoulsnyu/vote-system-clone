import os
from bs4 import BeautifulSoup
from typing import List, Dict, Optional
import re

class VoteOption:
    def __init__(self, image_src: str, name: str, description: str, social_links: List[str]):
        self.image_src = image_src
        self.name = name
        self.description = description
        self.social_links = social_links

    def to_ts_dict(self) -> str:
        youtube_link = ""
        facebook_link = ""
        
        for link in self.social_links:
            if "youtube.com" in link:
                youtube_link = link
            elif any(domain in link for domain in ["facebook.com", "instagram.com", "tiktok.com"]):
                facebook_link = link

        return f"""    {{
      imageSrc: "{self.image_src}",
      name: "{self.name}",
      description: "{self.description}",
      youtubeLink: "{youtube_link}",
      facebookLink: "{facebook_link}"
    }}"""

def extract_image_src(img_tag) -> str:
    if img_tag:
        src = img_tag.get('src', '')
        # Extract just the filename
        filename = os.path.basename(src)
        return f"@/app/assets/images/{filename}"
    return ""

def extract_social_links(share_div) -> List[str]:
    if not share_div:
        return []
    
    links = share_div.find_all('a', href=True)
    return [link['href'] for link in links if link['href']]

def parse_html(html_content: str) -> List[VoteOption]:
    soup = BeautifulSoup(html_content, 'html.parser')
    cards = soup.find_all('div', class_='card')
    vote_options: List[VoteOption] = []

    for card in cards:
        img_tag = card.find('img')
        image_src = extract_image_src(img_tag)
        
        # Find name and description
        text_nodes = [text for text in card.stripped_strings]
        name = text_nodes[0] if len(text_nodes) > 0 else ""
        description = text_nodes[1] if len(text_nodes) > 1 else ""
        
        # Find social links
        share_div = card.find('div', class_='share')
        social_links = extract_social_links(share_div)
        
        vote_option = VoteOption(image_src, name, description, social_links)
        vote_options.append(vote_option)
    
    return vote_options

def generate_ts_file(vote_options: List[VoteOption], output_file: str):
    ts_content = """// VotesData.ts

export interface VoteOption {
    imageSrc: string;
    name: string;
    description: string;
    youtubeLink: string;
    facebookLink: string;
}

export const voteOptions: VoteOption[] = [
"""
    
    options_str = ',\n'.join(option.to_ts_dict() for option in vote_options)
    ts_content += options_str
    ts_content += "\n];\n"
    
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write(ts_content)

def main():
    try:
        # Read HTML file
        with open('Scrapable.html', 'r', encoding='utf-8') as f:
            html_content = f.read()
        
        # Parse HTML and extract data
        vote_options = parse_html(html_content)
        
        # Generate TypeScript file
        generate_ts_file(vote_options, 'VotesData.ts')
        print("Successfully generated VotesData.ts")
        
    except FileNotFoundError:
        print("Error: Could not find the HTML file. Make sure 'Scrapable.html' exists in the current directory.")
    except Exception as e:
        print(f"An error occurred: {str(e)}")

if __name__ == "__main__":
    main()