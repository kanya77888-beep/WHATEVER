import os
import sys
from google import genai
import pypdf

# This is the template for the prompt!
REVIEW_PROMPT_TEMPLATE = """Evaluate the following research paper section using the criteria below.

Target Scope/Keywords: {scope_text}

For EACH criterion:
- Give a score from 1 to 5 (except for Scope Fit and AI Authorship, provide a score from 1 to 100).
- Explain EXACTLY why marks were deducted (if applicable).
- Quote specific sentences or passages from the paper where the problem occurs.
- Provide clear, actionable improvement points.

Criteria:
1. Clarity & Writing Quality
2. Novelty / Originality
3. Technical Soundness
4. Methodology & Rigor
5. Significance / Impact
6. Structure & Organization
7. Literature & References
8. Scope Fit (Evaluate alignment with the Target Scope/Keywords)
9. AI Authorship Score (Estimate the likelihood the text was AI-generated from 1 to 100, where 100 means definitely AI)

IMPORTANT:
- Avoid generic statements
- Be specific and critical
- Base feedback ONLY on the text provided

Research paper section:
"""

def main():
    # 1. Ask for the API key directly if it's not naturally in the environment
    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        print("I couldn't find your API key in the environment.")
        # Ask them directly instead of failing!
        api_key = input("Please paste your Gemini API Key here and press Enter: ").strip()
        
        if not api_key:
            print("Error: No API key provided.")
            sys.exit(1)

    # 2. Setup the Gemini Client
    try:
        client = genai.Client(api_key=api_key)
    except Exception as e:
        print(f"Failed to initialize Gemini Client: {e}")
        sys.exit(1)

    # 3. Figure out which file to read (defaults to test_paper.txt)
    paper_file = "test_paper.txt"
    if len(sys.argv) > 1:
        paper_file = sys.argv[1]

    if not os.path.exists(paper_file):
        print(f"Error: The file '{paper_file}' does not exist.")
        print("Make sure you provide the correct filename or that test_paper.txt is in the same folder.")
        sys.exit(1)

    # Read the paper content
    if paper_file.lower().endswith('.pdf'):
        try:
            reader = pypdf.PdfReader(paper_file)
            paper_content = ""
            for page in reader.pages:
                paper_content += page.extract_text() + "\n"
        except Exception as e:
            print(f"Failed to read PDF file: {e}")
            sys.exit(1)
    else:
        with open(paper_file, "r", encoding="utf-8") as f:
            paper_content = f.read()

    # 3.5 Ask for scope/keywords
    print("\n--- Scope Alignment ---")
    scope = input("Enter target keywords or target journal scope to check alignment (or press Enter to skip): ").strip()
    if not scope:
        scope = "Not specified. Evaluate independently."
        
    final_prompt = REVIEW_PROMPT_TEMPLATE.format(scope_text=scope)

    print(f"\nReading '{paper_file}' and sending to Gemini for review...")
    print("-" * 50)
    
    # 4. Generate the response by combining your prompt + the paper
    try:
        # We are using gemini-2.5-flash as it is fast and excellent at these tasks
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=final_prompt + "\n" + paper_content
        )
        print("--- REVIEW RESULTS ---\n")
        print(response.text)
    except Exception as e:
        print(f"An error occurred while communicating with Gemini: {e}")

if __name__ == "__main__":
    main()
