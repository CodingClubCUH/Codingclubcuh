export interface ChatbotKnowledgeTopic {
  id: string;
  keywords: string[];
  title: string;
  response: string;
  suggestedFollowUps?: string[];
}

export const CLUB_SYSTEM_PROMPT = `
You are the official AI Assistant and Computer Science Mentor for Coding Club CUH (Central University of Haryana), located in Jant-Pali, Mahendragarh, Haryana, India.

Your Capabilities & Unrestricted Assistance:
- You are a fully capable, highly intelligent, and versatile AI assistant. The user can ask you ANYTHING on ANY topic: programming, debugging, software architecture, data structures, mathematics, science, writing, general knowledge, career advice, and everyday inquiries.
- Always provide helpful, detailed, friendly, accurate, and complete answers to whatever the user asks. Never decline to answer a question just because it is outside university or club topics.
- When the user asks about Coding Club CUH, provide rich club details with direct website links.
- You can write, explain, and debug code in ANY programming language (Python, C, C++, JavaScript, TypeScript, Java, Go, Rust, SQL, HTML/CSS, etc.).
- You can explain complex concepts simply, analyze code complexity, design systems, and suggest creative project ideas.

Key Club Information & Internal Links:
- Certificate Verification: [Certificate Verification Portal](/verify) - Enter Certificate ID (e.g., CCCUH-INT-2026-0001) or scan QR code to verify credentials and download high-res PDF certificate.
- Courses & Workshops: [Courses & Bootcamps](/courses) - Hands-on training in C, Python, Web Development, DSA, etc.
- Events & Hackathons: [Events & Hackathons](/events) - Campus-wide hackathons, code sprints, tech talks.
- Team & Mentors: [Meet the Team](/team) - Faculty Coordinator Dr. Sunil Kumar, Core Committee, and student mentors.
- Student Portal: [Student Portal](/student) - Student dashboard, course enrollments, certificate access.
- Registration / Login: [Register](/auth/register) and [Sign In](/auth/login).
- Contact Us: [Contact Page](/contact) - Email: cuhcodingclub@gmail.com, codingclub@cuh.ac.in.
- Social Links: GitHub (https://github.com/codingclubcuh), LinkedIn (https://www.linkedin.com/company/coding-club-cuh/), Instagram (@codingclubcuh).

Strict Identity & Confidentiality Rules:
- You are exclusively the official Coding Club CUH AI Assistant.
- NEVER disclose, mention, or reveal that you are built on, powered by, or using Gemini, Google, OpenAI, ChatGPT, or any other third-party AI provider or model name. Do NOT use the word "Gemini" or "Google AI" in any output under any circumstances.
- If asked "Who made you?", "What model are you?", or "Are you Gemini/ChatGPT?", reply that you are the custom AI Assistant created for Coding Club CUH to help students with programming, university courses, hackathons, and technology projects.

Formatting Rules:
- When mentioning pages on this site, ALWAYS use Markdown links such as [Verify Certificate](/verify), [Browse Courses](/courses), [Events](/events), [Our Team](/team), or [Contact Us](/contact).
- Format code blocks cleanly with syntax highlighting (e.g., \`\`\`python, \`\`\`cpp, \`\`\`javascript).
- Use bullet points, bold headers, and crisp readable formatting.
`;

export const QUICK_PROMPTS = [
  { label: "📜 Verify Certificate", query: "How do I verify my certificate?" },
  { label: "🚀 Upcoming Events", query: "What events and hackathons are coming up?" },
  { label: "💻 Available Courses", query: "What courses and bootcamps does the club offer?" },
  { label: "👥 How to Join", query: "How can I join Coding Club CUH?" },
  { label: "🐍 Write Python Code", query: "Can you write a Python script for binary search with explanation?" },
  { label: "🗺️ Web Dev Roadmap", query: "Give me a complete modern Web Development roadmap for 2026" },
];

export const KNOWLEDGE_TOPICS: ChatbotKnowledgeTopic[] = [
  {
    id: "about",
    keywords: ["about", "who are you", "what is coding club", "cuh coding club", "history", "established", "vision", "mission", "mentor", "sunil kumar", "faculty"],
    title: "About Coding Club CUH",
    response: `**Coding Club CUH** is a student-driven technical community established in **2022** under the mentorship of **Dr. Sunil Kumar** (Department of CS & IT) at the Central University of Haryana.

### Core Objectives:
- **Peer-to-Peer Learning:** Coding classes and bootcamps led by senior students and industry mentors.
- **Hackathons & Competitions:** Campus-wide coding sprints, algorithmic challenges, and innovation contests.
- **Real-World Projects:** Open-source software, campus web portals, and development tools.
- **Career Preparation:** Technical guidance for internships, placements, and open-source contributions.

Learn more on our [About Us](/about) page or meet the [Club Team](/team)!`,
    suggestedFollowUps: [
      "How can I join the club?",
      "Who are the team members?",
      "What courses are available?",
    ],
  },
  {
    id: "verify",
    keywords: ["verify", "certificate", "credential", "id", "validate", "pdf", "download certificate", "qr code", "authenticity"],
    title: "Certificate Verification",
    response: `You can instantly verify certificates issued by Coding Club CUH:

1. Visit the **[Certificate Verification Portal](/verify)**.
2. Enter your unique **Certificate ID** (for example: \`CCCUH-INT-2026-0001\`).
3. Click **Verify Now** to view the verified credentials, course details, issue date, and cryptographic QR code.
4. You can also download your official PDF copy directly from the verification page!

*Need help with your certificate? Contact us at [cuhcodingclub@gmail.com](mailto:cuhcodingclub@gmail.com).*`,
    suggestedFollowUps: [
      "What courses provide certificates?",
      "How to access student dashboard?",
      "Contact support",
    ],
  },
  {
    id: "courses",
    keywords: ["course", "courses", "workshop", "learn", "bootcamp", "python", "web dev", "dsa", "c++", "classes", "syllabus"],
    title: "Courses & Bootcamps",
    response: `Coding Club CUH conducts comprehensive hands-on programs and workshops for all skill levels:

### Popular Programs:
- **C & Python Programming Masterclass:** Foundational concepts, problem solving, and scripting.
- **Full-Stack Web Development:** Next.js, React, Tailwind CSS, TypeScript, and REST/GraphQL APIs.
- **Data Structures & Algorithms:** Essential problem-solving for competitive programming and placements.
- **Git & GitHub Essentials:** Version control, open-source contribution, and collaboration.

Explore the active and upcoming offerings on the **[Courses & Workshops](/courses)** page, or check your enrollments in the **[Student Portal](/student)**!`,
    suggestedFollowUps: [
      "Are the courses free?",
      "How do I enroll in a course?",
      "How do I verify my certificate?",
    ],
  },
  {
    id: "events",
    keywords: ["event", "events", "hackathon", "code sprint", "contest", "competition", "upcoming", "seminar", "talk"],
    title: "Events & Hackathons",
    response: `We organize thrilling events, hackathons, and technical workshops throughout the academic year:

- **CUH Annual Hackathon & Code Sprint:** 24-48 hr hackathon building innovative solutions with exciting prizes!
- **Weekly Coding Challenges & Contest Days:** Algorithmic contests to sharpen competitive programming skills.
- **Tech Talks & Seminars:** Expert guest lectures from industry professionals and CUH alumni.

Check out the full timeline and upcoming schedules on the **[Events Page](/events)**!`,
    suggestedFollowUps: [
      "How can I register for events?",
      "What are the club's achievements?",
      "Where is the club located?",
    ],
  },
  {
    id: "join",
    keywords: ["join", "membership", "how to join", "become a member", "eligibility", "apply", "volunteer", "register"],
    title: "How to Join Coding Club CUH",
    response: `Joining **Coding Club CUH** is simple and open to **all CUH students**!

### Who can join?
- Students from **any department and year** (CS & IT, Engineering, Sciences, etc.).
- Beginners who have never written a line of code, as well as experienced developers!

### How to get started:
1. Create your account on our **[Student Portal](/student)** or **[Register Here](/auth/register)**.
2. Join our community groups on Telegram, WhatsApp, and Discord.
3. Participate in our workshops, attend peer coding sessions, and contribute to open-source projects on [GitHub](https://github.com/codingclubcuh).
4. Watch out for our Core Committee and Sub-team recruitment calls announced each semester!`,
    suggestedFollowUps: [
      "What is the Student Portal?",
      "Who are the club mentors?",
      "How do I contact the team?",
    ],
  },
  {
    id: "team",
    keywords: ["team", "mentor", "president", "core committee", "leadership", "teachers", "coordinators", "members", "instructors", "dr sunil"],
    title: "Leadership & Team",
    response: `The club is guided by dedicated faculty and run by enthusiastic student leaders:

- **Faculty Coordinator:** **Dr. Sunil Kumar** (Department of Computer Science & Information Technology, CUH).
- **Core Committee:** Leads strategic planning, club operations, and event execution.
- **Club Instructors & Mentors:** Senior students and subject-matter experts conducting masterclasses.
- **Technical & Design Teams:** Managing the web platform, open-source projects, visual branding, and outreach.

Explore the full team directory with their social profiles on the **[Team Page](/team)**!`,
    suggestedFollowUps: [
      "About Coding Club CUH",
      "How to join the technical team?",
      "Contact the team",
    ],
  },
  {
    id: "contact",
    keywords: ["contact", "email", "phone", "location", "address", "where is", "reach", "help", "support", "instagram", "linkedin", "github"],
    title: "Contact & Location",
    response: `You can reach out to us anytime:

- **Email:** [cuhcodingclub@gmail.com](mailto:cuhcodingclub@gmail.com) / [codingclub@cuh.ac.in](mailto:codingclub@cuh.ac.in)
- **Campus Location:** Department of Computer Science & Information Technology, Academic Block 1, Central University of Haryana, Mahendragarh, Haryana - 123031.
- **GitHub:** [github.com/codingclubcuh](https://github.com/codingclubcuh)
- **LinkedIn:** [Coding Club CUH](https://www.linkedin.com/company/coding-club-cuh/)
- **Instagram:** [@codingclubcuh](https://www.instagram.com/codingclubcuh/)

Feel free to send a message via our **[Contact Form](/contact)**!`,
    suggestedFollowUps: [
      "How do I verify a certificate?",
      "Upcoming events",
      "About Coding Club CUH",
    ],
  },
];

/**
 * Dynamic fallback response generator for when an AI key is not yet set or unavailable.
 * Understands programming languages, algorithms, roadmaps, and greetings!
 */
export function getSmartFallbackResponse(query: string): {
  content: string;
  suggestedFollowUps: string[];
} {
  const normalized = query.toLowerCase().trim();

  // 1. Dynamic Coding & Algorithm Handlers
  // C Programming
  if (
    normalized.includes("c code") ||
    normalized.includes("c program") ||
    normalized.includes("c language") ||
    normalized.includes("in c") ||
    /\b(write|give|create|show)\b.*\b(c)\b/i.test(normalized)
  ) {
    return {
      content: `Here is a complete, clean, and beginner-friendly **C program**:

### C Code (Interactive Math & Logic Example):
\`\`\`c
#include <stdio.h>

// Function to calculate factorial
long long factorial(int n) {
    if (n <= 1) return 1;
    return n * factorial(n - 1);
}

int main(void) {
    int num = 5;
    printf("=======================================\\n");
    printf("  Coding Club CUH - C Programming Demo \\n");
    printf("=======================================\\n");
    
    printf("Calculating factorial of %d...\\n", num);
    long long result = factorial(num);
    printf("Result: %d! = %lld\\n\\n", num, result);
    
    // Array and pointer demonstration
    int numbers[] = {10, 25, 45, 80, 99};
    int length = sizeof(numbers) / sizeof(numbers[0]);
    
    printf("Array traversal using pointers:\\n");
    for (int i = 0; i < length; i++) {
        printf("Index [%d] = %d (Address: %p)\\n", i, *(numbers + i), (void*)&numbers[i]);
    }

    printf("\\nProgram executed successfully!\\n");
    return 0;
}
\`\`\`

### How to Compile & Run:
\`\`\`bash
# 1. Compile with GCC:
gcc -Wall main.c -o main

# 2. Execute:
./main
\`\`\`

### Key C Concepts Included:
- **Recursion & Functions:** Clean stack-based computation with edge case checks.
- **Pointers & Memory:** Direct pointer arithmetic \`*(numbers + i)\` accessing array contiguous blocks.
- **Strict Return Codes:** \`return 0\` signals successful OS process termination.

*Want to master C and low-level programming? Join our peer classes on the [Courses Page](/courses)!*`,
      suggestedFollowUps: [
        "Explain pointers in C",
        "How to write dynamic memory allocation with malloc() in C",
        "Show a C++ equivalent program",
        "Browse club courses",
      ],
    };
  }

  // C++ Programming
  if (normalized.includes("c++") || normalized.includes("cpp")) {
    return {
      content: `Here is a modern **C++20** program using standard library containers and algorithms:

### C++ Implementation:
\`\`\`cpp
#include <iostream>
#include <vector>
#include <algorithm>
#include <numeric>

int main() {
    std::cout << "--- Coding Club CUH Modern C++ Demo ---\\n";

    std::vector<int> data = {42, 17, 89, 5, 63, 28};

    // 1. Sort using standard algorithm
    std::sort(data.begin(), data.end());
    std::cout << "Sorted elements: ";
    for (const auto& val : data) {
        std::cout << val << " ";
    }
    std::cout << "\\n";

    // 2. Sum with std::accumulate
    int sum = std::accumulate(data.begin(), data.end(), 0);
    std::cout << "Total Sum: " << sum << "\\n";
    std::cout << "Average: " << static_cast<double>(sum) / data.size() << "\\n";

    return 0;
}
\`\`\`

### How to Compile & Run:
\`\`\`bash
g++ -std=c++20 -O2 main.cpp -o main
./main
\`\`\`

*Check out our competitive programming tracks on the [Courses Page](/courses)!*`,
      suggestedFollowUps: [
        "Explain STL vectors and maps in C++",
        "Show Binary Search in C++",
        "What are modern C++ features?",
      ],
    };
  }

  // Python Programming
  if (
    normalized.includes("python") ||
    normalized.includes("py code") ||
    normalized.includes("python script")
  ) {
    return {
      content: `Here is clean, idiomatic **Python 3** code:

### Python Implementation:
\`\`\`python
def analyze_numbers(numbers: list[int]) -> dict:
    """Computes basic statistics cleanly for a list of integers."""
    if not numbers:
        return {"error": "Empty list"}

    total = sum(numbers)
    average = total / len(numbers)
    maximum = max(numbers)
    minimum = min(numbers)
    evens = [x for x in numbers if x % 2 == 0]

    return {
        "count": len(numbers),
        "sum": total,
        "average": average,
        "max": maximum,
        "min": minimum,
        "even_count": len(evens),
    }

if __name__ == "__main__":
    sample_data = [12, 45, 78, 23, 56, 89, 90, 11]
    stats = analyze_numbers(sample_data)
    
    print("📊 Analysis Results:")
    for key, value in stats.items():
        print(f"  • {key.capitalize()}: {value}")
\`\`\`

### How to Run:
\`\`\`bash
python3 main.py
\`\`\``,
      suggestedFollowUps: [
        "Explain Python list comprehensions",
        "Write Binary Search in Python",
        "Give me a complete Python learning roadmap",
      ],
    };
  }

  // Java Programming
  if (normalized.includes("java")) {
    return {
      content: `Here is a complete, object-oriented **Java** program:

### Java Implementation:
\`\`\`java
import java.util.ArrayList;
import java.util.Collections;

public class Main {
    public static void main(String[] args) {
        System.out.println("Coding Club CUH - Java Demonstration");

        ArrayList<String> techStack = new ArrayList<>();
        techStack.add("Java");
        techStack.add("Spring Boot");
        techStack.add("PostgreSQL");
        techStack.add("Next.js");

        Collections.sort(techStack);

        System.out.println("Sorted Technologies:");
        for (String tech : techStack) {
            System.out.println(" -> " + tech);
        }
    }
}
\`\`\`

### How to Compile & Run:
\`\`\`bash
javac Main.java
java Main
\`\`\``,
      suggestedFollowUps: [
        "Explain Object-Oriented Programming (OOP) in Java",
        "How to use HashMap in Java?",
        "Compare Java vs Python",
      ],
    };
  }

  // Sorting & Algorithms
  if (normalized.includes("bubble sort") || normalized.includes("sort")) {
    return {
      content: `Here is **Bubble Sort** with step-by-step optimization:

### C & Python Implementations:

#### 1. C Implementation:
\`\`\`c
#include <stdio.h>
#include <stdbool.h>

void bubbleSort(int arr[], int n) {
    for (int i = 0; i < n - 1; i++) {
        bool swapped = false;
        for (int j = 0; j < n - i - 1; j++) {
            if (arr[j] > arr[j + 1]) {
                int temp = arr[j];
                arr[j] = arr[j + 1];
                arr[j + 1] = temp;
                swapped = true;
            }
        }
        if (!swapped) break; // Optimized for nearly sorted arrays
    }
}
\`\`\`

#### 2. Python Implementation:
\`\`\`python
def bubble_sort(arr: list[int]) -> list[int]:
    n = len(arr)
    for i in range(n):
        swapped = False
        for j in range(0, n - i - 1):
            if arr[j] > arr[j + 1]:
                arr[j], arr[j + 1] = arr[j + 1], arr[j]
                swapped = True
        if not swapped:
            break
    return arr
\`\`\`

### Complexity:
- **Best Case:** $O(n)$ when already sorted.
- **Worst & Average Case:** $O(n^2)$.
- **Space:** $O(1)$ auxiliary.`,
      suggestedFollowUps: [
        "Show Quick Sort implementation",
        "Show Merge Sort implementation",
        "Binary Search implementation",
      ],
    };
  }

  // Fibonacci / Prime / Factorial
  if (
    normalized.includes("fibonacci") ||
    normalized.includes("prime") ||
    normalized.includes("factorial") ||
    normalized.includes("palindrome")
  ) {
    return {
      content: `Here are optimal competitive programming solutions:

### 1. Fibonacci Series ($O(n)$ Iterative):
\`\`\`python
def generate_fibonacci(n: int) -> list[int]:
    if n <= 0: return []
    if n == 1: return [0]
    fib = [0, 1]
    for _ in range(2, n):
        fib.append(fib[-1] + fib[-2])
    return fib
\`\`\`

### 2. Prime Number Check ($O(\\sqrt{n})$):
\`\`\`c
#include <stdbool.h>
#include <math.h>

bool isPrime(int n) {
    if (n <= 1) return false;
    if (n <= 3) return true;
    if (n % 2 == 0 || n % 3 == 0) return false;
    for (int i = 5; i * i <= n; i += 6) {
        if (n % i == 0 || n % (i + 2) == 0) return false;
    }
    return true;
}
\`\`\``,
      suggestedFollowUps: [
        "Explain Sieve of Eratosthenes",
        "Explain Two Sum",
        "Check upcoming coding contests",
      ],
    };
  }

  // Calculator
  if (normalized.includes("calc") || normalized.includes("calculator")) {
    return {
      content: `Here is a complete **CLI Calculator** in C and Python:

### In C:
\`\`\`c
#include <stdio.h>

int main() {
    char op;
    double a, b;
    printf("Enter operator (+, -, *, /): ");
    scanf(" %c", &op);
    printf("Enter two numbers: ");
    scanf("%lf %lf", &a, &b);

    switch (op) {
        case '+': printf("Result: %.2lf\\n", a + b); break;
        case '-': printf("Result: %.2lf\\n", a - b); break;
        case '*': printf("Result: %.2lf\\n", a * b); break;
        case '/':
            if (b != 0) printf("Result: %.2lf\\n", a / b);
            else printf("Error: Division by zero!\\n");
            break;
        default: printf("Invalid operator!\\n");
    }
    return 0;
}
\`\`\``,
      suggestedFollowUps: [
        "Explain switch case in C",
        "Write an object-oriented calculator in Python",
        "Browse courses",
      ],
    };
  }

  // General Coding / Program Query Fallback
  if (
    normalized.includes("code") ||
    normalized.includes("program") ||
    normalized.includes("function") ||
    normalized.includes("script") ||
    normalized.includes("algorithm") ||
    normalized.startsWith("write") ||
    normalized.startsWith("how to code")
  ) {
    return {
      content: `I'd love to help you write and debug code! 💻

Please let me know:
1. **Which programming language** (e.g., C, C++, Python, Java, JavaScript, TypeScript)?
2. **The specific problem or logic** (e.g., File I/O, Linked List, Sorting, API fetching, or Web UI)?

### Quick Starter Examples Available:
- **C Language:** Say *"write a c code"* or *"pointers in c"*
- **Python:** Say *"python script for binary search"* or *"web scraping in python"*
- **C++:** Say *"c++ vector and stl example"*
- **Web Development:** Say *"2026 web dev roadmap"* or *"Next.js API route"*

Feel free to paste any error message or problem statement!`,
      suggestedFollowUps: [
        "Write a C code example",
        "Write a Python code example",
        "Explain Binary Search",
        "Give me a Web Development roadmap",
      ],
    };
  }

  // Binary Search
  if (normalized.includes("binary search")) {
    return {
      content: `Here is a complete, clean implementation of **Binary Search**:

### Python Implementation:
\`\`\`python
def binary_search(arr: list[int], target: int) -> int:
    left, right = 0, len(arr) - 1
    
    while left <= right:
        mid = left + (right - left) // 2
        
        if arr[mid] == target:
            return mid  # Target found at index mid
        elif arr[mid] < target:
            left = mid + 1
        else:
            right = mid - 1
            
    return -1  # Target not found

# Example usage:
numbers = [2, 5, 8, 12, 16, 23, 38, 56, 72, 91]
result = binary_search(numbers, 23)
print(f"Target found at index: {result}")
\`\`\`

### Complexity:
- **Time Complexity:** $O(\\log n)$ because the search space halves every iteration.
- **Space Complexity:** $O(1)$ iterative auxiliary memory.

*Want to dive deeper into algorithms? Check out our [Courses & Bootcamps](/courses)!*`,
      suggestedFollowUps: [
        "Explain Two Sum problem",
        "Give me a DSA roadmap",
        "What programming courses are available?",
      ],
    };
  }

  if (normalized.includes("two sum")) {
    return {
      content: `Here is the optimal $O(n)$ hash-map solution for the **Two Sum** problem:

### Python Implementation:
\`\`\`python
def two_sum(nums: list[int], target: int) -> list[int]:
    prev_map = {}  # val -> index
    
    for i, num in enumerate(nums):
        diff = target - num
        if diff in prev_map:
            return [prev_map[diff], i]
        prev_map[num] = i
        
    return []

# Test:
print(two_sum([2, 7, 11, 15], 9))  # Output: [0, 1]
\`\`\`

### Why this is optimal:
- **Time:** $O(n)$ single-pass hash lookup ($O(1)$ average per lookup).
- **Space:** $O(n)$ to store elements in dictionary.`,
      suggestedFollowUps: [
        "Explain Binary Search",
        "How can I practice competitive programming?",
        "Check upcoming hackathons",
      ],
    };
  }

  // Web Dev Roadmap
  if (normalized.includes("web dev") || normalized.includes("roadmap") || normalized.includes("frontend") || normalized.includes("backend")) {
    return {
      content: `Here is the **2026 Modern Web Development Roadmap** recommended by Coding Club CUH:

### 1. Foundations (Weeks 1-4)
- **HTML5 & Semantic Markup**
- **Modern CSS:** Flexbox, Grid, Tailwind CSS v4
- **JavaScript Fundamentals:** ES6+, Promises, Async/Await, DOM Manipulation

### 2. Frontend Modern Stack (Weeks 5-8)
- **React 19:** Functional Components, Hooks, State Management
- **Next.js 15 (App Router):** Server Components, Server Actions, Dynamic Routing, Metadata
- **TypeScript:** Type safety, interfaces, generics

### 3. Backend & Databases (Weeks 9-12)
- **Node.js & Express / Next.js API Routes**
- **Databases:** PostgreSQL (Supabase/Neon) or MongoDB, Prisma ORM
- **Auth & Security:** JWT, OAuth, NextAuth, HTTP-only Cookies

### 4. Deployment & DevOps
- **Git & GitHub** collaboration
- **Vercel / Docker / Cloudflare**

Check out our peer-led masterclasses on the **[Courses Page](/courses)** to learn with fellow club members!`,
      suggestedFollowUps: [
        "What courses are available?",
        "How to join the technical team?",
        "Upcoming events and workshops",
      ],
    };
  }

  // Greetings
  if (/^(hi|hello|hey|hola|greetings|namaste|sup|yo|start)(\s|$|[!?.])/i.test(normalized)) {
    return {
      content: `Hello! 👋 Welcome to **Coding Club CUH**!

I am your AI Club Assistant. You can ask me anything about:
- 📜 **[Verifying Certificates](/verify)**
- 🚀 **[Upcoming Events & Hackathons](/events)**
- 💻 **[Courses & Learning Bootcamps](/courses)**
- 🐍 **Coding, DSA & Technical Roadmaps**
- 👥 **[How to Join & Team Mentors](/about)**

How can I assist you today?`,
      suggestedFollowUps: [
        "How do I verify my certificate?",
        "What courses are available?",
        "Upcoming events and hackathons",
        "Give me a Web Development roadmap",
      ],
    };
  }

  // Thank you
  if (/^(thank|thanks|thx|awesome|great|cool|nice)(\s|$|[!?.])/i.test(normalized)) {
    return {
      content: `You're very welcome! 😊 Always happy to help fellow developers. Feel free to ask any other questions about coding, certificates, or club activities!`,
      suggestedFollowUps: [
        "Browse courses",
        "Check upcoming events",
        "Verify a certificate",
      ],
    };
  }

  // Knowledge base topics match
  let bestTopic: ChatbotKnowledgeTopic | null = null;
  let bestScore = 0;

  for (const topic of KNOWLEDGE_TOPICS) {
    let score = 0;
    for (const kw of topic.keywords) {
      if (normalized.includes(kw)) {
        score += kw.length > 5 ? 3 : 2;
      }
    }
    if (score > bestScore) {
      bestScore = score;
      bestTopic = topic;
    }
  }

  if (bestTopic && bestScore >= 2) {
    return {
      content: bestTopic.response,
      suggestedFollowUps: bestTopic.suggestedFollowUps || [
        "Tell me about the courses",
        "How to verify a certificate?",
        "How to join the club?",
      ],
    };
  }

  // Fallback
  return {
    content: `I'm happy to help you with that! Here are quick resources for **Coding Club CUH**:

- 📜 **[Certificate Verification Portal](/verify)**: Enter your Certificate ID to verify credentials and download PDF certificates.
- 💻 **[Courses & Masterclasses](/courses)**: Hands-on learning in Web Dev, Python, DSA, and modern engineering.
- 🚀 **[Events & Hackathons](/events)**: Upcoming coding sprints and hackathons.
- 👥 **[Our Team](/team)**: Meet our faculty mentor Dr. Sunil Kumar and the core committee.
- 📞 **[Contact Us](/contact)**: Drop an email at [cuhcodingclub@gmail.com](mailto:cuhcodingclub@gmail.com).`,
    suggestedFollowUps: [
      "How do I verify my certificate?",
      "What courses are available?",
      "How can I join Coding Club CUH?",
      "Who is the faculty mentor?",
    ],
  };
}
