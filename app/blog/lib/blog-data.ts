export interface BookPost {
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  date: string;
  readTime: string;
  tags: string[];
  image?: string;
  author: string;
  published: boolean;
}

// 📖 My Life Story - Book Chapters
// Each book post represents a chapter in your life story
// To add a new chapter, copy the template at the bottom and customize it

const bookPosts: BookPost[] = [
  {
    slug: 'chapter-1-the-beginning',
    title: 'Chapter 1: The Beginning',
    excerpt:
      'Every story has a beginning. This is mine - where it all started and the early memories that shaped who I am today.',
    content: `

  
 # Understanding

I am only able to write this because i feel that no one is going to read it and i can say anything about my life, that's the only motivation i have.

I am just a <span style="position: relative; display: inline-block;">Normal<span style="position: absolute; top: 50%; left: 0; right: 0; height: 2px; background: currentColor; transform: translateY(-50%);"></span></span> guy who is trying to write about his life experiences and share wounderful weird awkward moments of my life and trust me on this i have a lot of stories to tell.
and its not a clickbate article, i am not trying to sell you anything here, its just about stories of my life.

I am not a good writer, nor am i a good storyteller. 

haven't written any blogs or even my practical files in my life this is a first time for me. 

Just a disclaimer,
I make terrible spelling mistakes and grammatical errors. So, somethings might have to guess what i mean. but i hoping you will get the feeling what i am trying to say.

Let me tell you a bit about myself and where I stand right now.

My name is Yash Siwach, a 21 years old guy who has absolutely no idea what he is doing with his life. 
I completed my Bachelor’s in Computer Applications from Chandigarh University in 2025. After that, 
I joined VIT Vellore for a master’s in Artificial Intelligence and Machine Learning, but I dropped out before the first semester ended.

Now I live with my mother and sister in Chandigarh, doing absolutely nothing.
It’s not that I am dumb or useless. On paper, I look like one of those smart guys who used to run his own web agency during college. 
lived in Gurugram for the last 8 months of my degree, worked in various companies for various roles gaining experience and learning a lot in that short span of time.

Even a week ago my last interviewer, the CEO of a company, told me that I reminded him of manager he had back in the day. and said "you have lot of potential and will do something great in my life."

He offered me a job. I said no.
Why? I still don’t know. Maybe the salary felt too low. Or maybe I was just tired of pretending I knew what I wanted.

And that brings me here.

How did I end up in this place? Why am I writing this? Why am I still here? Why am I even alive?





---

*"Every story has a beginning. This is where mine starts."*

## The Early Days



I was born in 2004 at a government hospital in Gurugram. It doesn’t exist anymore they shifted it, demolished it, maybe buried my birth certificate with it. 
Now there’s just a gate and a parking lot, like someone deleted the “building” part of life’s code.



to be continued...


---

*This is just the beginning of the story. There's so much more to come.*`,
    date: '2024-10-11',
    readTime: '5 min read',
    tags: ['Life Story', 'Childhood', 'Personal', 'Origins'],
    image: '/book/chapter-1.jpg', // Optional: Add your image to /public/book/
    author: 'Yash Siwach',
    published: true, // Set to false if you're not ready to publish yet
  },
  //   {
  //     slug: 'chapter-2-discovery',
  //     title: 'Chapter 2: Discovery',
  //     excerpt:
  //       'The years of discovery - finding my interests, passions, and beginning to understand what made me unique.',
  //     content: `# Chapter 2: Discovery

  // *"The journey of self-discovery begins when we start asking who we really are."*

  // ---

  // ## Finding My Path

  // [Write about your teenage years, education, first interests]

  // During my school years, I started to discover...

  // The subjects I loved were...

  // ## The First Spark

  // I remember the moment when I first felt passionate about something:

  // [Describe the moment/experience that sparked a passion]

  // It happened when...

  // What made it special was...

  // ## Interests and Hobbies

  // During this time, I explored:

  // ### [Interest/Hobby 1]
  // [Why you were drawn to it, what you learned]

  // ### [Interest/Hobby 2]
  // [Why you were drawn to it, what you learned]

  // ### [Interest/Hobby 3]
  // [Why you were drawn to it, what you learned]

  // ## Challenges Faced

  // Not everything was smooth sailing. I faced:

  // - **[Challenge 1]**: [How you dealt with it]
  // - **[Challenge 2]**: [How you dealt with it]
  // - **[Challenge 3]**: [What you learned]

  // ## People Who Influenced Me

  // Several people made a significant impact during this phase:

  // **[Person 1]**: [Their influence on you]

  // **[Person 2]**: [Their influence on you]

  // **[Person 3]**: [Their influence on you]

  // ## Reflections

  // This period taught me that discovery is a continuous process. The key lessons were:

  // 1. [Lesson 1]
  // 2. [Lesson 2]
  // 3. [Lesson 3]

  // ---

  // *The journey of discovery never really ends, but this chapter set the foundation for everything that followed.*`,
  //     date: '2024-10-11',
  //     readTime: '7 min read',
  //     tags: ['Life Story', 'Discovery', 'Growth', 'Personal Journey'],
  //     image: '/book/chapter-2.jpg',
  //     author: 'Yash Siwach',
  //     published: true,
  //   },
  //   {
  //     slug: 'chapter-3-the-turning-point',
  //     title: 'Chapter 3: The Turning Point',
  //     excerpt:
  //       'Every life has moments that change everything. This is the story of mine - the decision that altered my path forever.',
  //     content: `# Chapter 3: The Turning Point

  // *"Sometimes one decision changes everything."*

  // ---

  // ## Before the Change

  // Life was [describe your situation before the turning point]...

  // I was working/studying/doing [what you were doing]...

  // Everything seemed to be going according to plan, but...

  // ## The Moment Everything Changed

  // [Describe the event, decision, or realization that was your turning point]

  // It happened on [time/date/period]...

  // I remember thinking...

  // The decision I had to make was:

  // > [Quote or describe the pivotal decision]

  // ## The Fear and Doubt

  // Making this change wasn't easy. I was afraid of:

  // - [Fear 1]
  // - [Fear 2]
  // - [Fear 3]

  // People around me said...

  // But deep down, I knew...

  // ## Taking the Leap

  // [Describe how you made the change]

  // The steps I took were:

  // 1. **[Step 1]**: [What you did]
  // 2. **[Step 2]**: [What you did]
  // 3. **[Step 3]**: [What you did]

  // ## The Immediate Impact

  // Once I made the change:

  // - [What happened immediately]
  // - [How life changed in the short term]
  // - [Initial challenges you faced]

  // ## Looking Back

  // Now, looking back at that turning point, I realize:

  // **What I learned:**
  // [Key lesson 1]

  // **What I would tell myself then:**
  // [Advice to past self]

  // **Why it mattered:**
  // [The long-term impact]

  // ## A New Direction

  // This turning point set me on a completely new path:

  // [Describe the new direction your life took]

  // ---

  // *Sometimes the scariest decisions lead to the most beautiful destinations.*`,
  //     date: '2024-10-11',
  //     readTime: '8 min read',
  //     tags: ['Life Story', 'Turning Point', 'Decisions', 'Life Lessons', 'Change'],
  //     image: '/book/chapter-3.jpg',
  //     author: 'Yash Siwach',
  //     published: true,
  //   },
  //   {
  //     slug: 'chapter-4-building-dreams',
  //     title: 'Chapter 4: Building Dreams',
  //     excerpt:
  //       'With a new direction set, it was time to build. This chapter is about the work, the hustle, and turning dreams into reality.',
  //     content: `# Chapter 4: Building Dreams

  // *"Dreams don't work unless you do."*

  // ---

  // ## The Vision

  // After my turning point, I had a clear vision:

  // [Describe your dream/goal/aspiration]

  // I wanted to...

  // What success looked like to me:

  // - [Success metric 1]
  // - [Success metric 2]
  // - [Success metric 3]

  // ## The Beginning of the Journey

  // I started by:

  // ### Phase 1: Learning
  // [What you had to learn, how you learned it]

  // The resources I used:
  // - [Resource 1]
  // - [Resource 2]
  // - [Resource 3]

  // ### Phase 2: Taking Action
  // [First steps you took toward your dream]

  // My first project/attempt was:
  // [Describe it]

  // ### Phase 3: Failing Forward
  // [Early failures and what they taught you]

  // I failed at:
  // - [Failure 1] - But I learned: [Lesson]
  // - [Failure 2] - But I learned: [Lesson]
  // - [Failure 3] - But I learned: [Lesson]

  // ## The Grind

  // Building dreams requires consistent effort. My daily routine looked like:

  // **Morning**: [What you did]

  // **Afternoon**: [What you did]

  // **Evening**: [What you did]

  // The sacrifices I made:
  // - [Sacrifice 1]
  // - [Sacrifice 2]
  // - [Sacrifice 3]

  // ## Small Wins

  // Along the way, there were moments of victory:

  // ### Win 1: [First Achievement]
  // [What happened, why it mattered]

  // ### Win 2: [Second Achievement]
  // [What happened, why it mattered]

  // ### Win 3: [Third Achievement]
  // [What happened, why it mattered]

  // ## People Who Helped

  // I didn't do this alone. These people made a difference:

  // **[Person/Mentor 1]**: [How they helped]

  // **[Person/Mentor 2]**: [How they helped]

  // **[Community/Group]**: [How they supported you]

  // ## The Reality Check

  // Building dreams isn't just about success. The hard truths I learned:

  // 1. **[Truth 1]**: [Explanation]
  // 2. **[Truth 2]**: [Explanation]
  // 3. **[Truth 3]**: [Explanation]

  // ## Where I Am Now

  // As I write this chapter, [describe your current state]:

  // Progress made:
  // - [Progress 1]
  // - [Progress 2]
  // - [Progress 3]

  // Still working on:
  // - [Goal 1]
  // - [Goal 2]
  // - [Goal 3]

  // ## The Journey Continues

  // The dream is still being built, one day at a time. What keeps me going:

  // [Your motivation, why you continue]

  // ---

  // *The best view comes after the hardest climb.*`,
  //     date: '2024-10-11',
  //     readTime: '10 min read',
  //     tags: ['Life Story', 'Dreams', 'Career', 'Hustle', 'Goals', 'Personal Growth'],
  //     image: '/book/chapter-4.jpg',
  //     author: 'Yash Siwach',
  //     published: true,
  //   },
  //   {
  //     slug: 'chapter-5-lessons-learned',
  //     title: 'Chapter 5: Lessons Learned',
  //     excerpt:
  //       'Wisdom comes from experience. Here are the most important lessons life has taught me so far on this journey.',
  //     content: `# Chapter 5: Lessons Learned

  // *"We don't learn from experience. We learn from reflecting on experience."*

  // ---

  // ## Introduction

  // Life has been my greatest teacher. Looking back at everything I've experienced, these are the lessons that stand out the most.

  // ## Lesson 1: [Your Lesson Title]

  // ### What I Learned
  // [Explain the lesson]

  // ### How I Learned It
  // [The experience/story that taught you this]

  // ### How It Changed Me
  // [How this lesson impacted your life/decisions]

  // ### Applying It Today
  // [How you use this lesson now]

  // ---

  // ## Lesson 2: [Your Lesson Title]

  // ### What I Learned
  // [Explain the lesson]

  // ### How I Learned It
  // [The experience/story that taught you this]

  // ### How It Changed Me
  // [How this lesson impacted your life/decisions]

  // ### Applying It Today
  // [How you use this lesson now]

  // ---

  // ## Lesson 3: [Your Lesson Title]

  // ### What I Learned
  // [Explain the lesson]

  // ### How I Learned It
  // [The experience/story that taught you this]

  // ### How It Changed Me
  // [How this lesson impacted your life/decisions]

  // ### Applying It Today
  // [How you use this lesson now]

  // ---

  // ## Lesson 4: [Your Lesson Title]

  // ### What I Learned
  // [Explain the lesson]

  // ### How I Learned It
  // [The experience/story that taught you this]

  // ### How It Changed Me
  // [How this lesson impacted your life/decisions]

  // ### Applying It Today
  // [How you use this lesson now]

  // ---

  // ## Lesson 5: [Your Lesson Title]

  // ### What I Learned
  // [Explain the lesson]

  // ### How I Learned It
  // [The experience/story that taught you this]

  // ### How It Changed Me
  // [How this lesson impacted your life/decisions]

  // ### Applying It Today
  // [How you use this lesson now]

  // ---

  // ## The Big Picture

  // Putting it all together, these lessons have taught me:

  // **About Life:**
  // [Your philosophy on life]

  // **About Success:**
  // [Your definition of success]

  // **About Relationships:**
  // [Your thoughts on relationships]

  // **About Myself:**
  // [What you've learned about yourself]

  // ## Advice to Others

  // If I could share one piece of advice with someone reading this:

  // > [Your main piece of advice]

  // Because [why this advice matters].

  // ## Still Learning

  // The truth is, I'm still learning. New lessons appear every day:

  // - [Current lesson you're learning]
  // - [Question you're still exploring]
  // - [Area you're still growing in]

  // ## Final Thoughts

  // Life is a continuous classroom. The lessons never stop coming, and that's what makes it beautiful.

  // [Your closing thoughts]

  // ---

  // *The best lessons are the ones we learn by living.*`,
  //     date: '2024-10-11',
  //     readTime: '12 min read',
  //     tags: ['Life Story', 'Wisdom', 'Life Lessons', 'Reflections', 'Personal Growth'],
  //     image: '/book/chapter-5.jpg',
  //     author: 'Yash Siwach',
  //     published: true,
  //   },

  // 📝 TEMPLATE FOR NEW CHAPTERS
  // Copy this template to add new chapters to your life story
  /*
  {
    slug: 'chapter-X-your-chapter-name',
    title: 'Chapter X: Your Chapter Title',
    excerpt: 'A brief 1-2 sentence description of what this chapter is about.',
    content: `# Chapter X: Your Chapter Title

*"A meaningful quote that captures this chapter"*

---

## Your Section 1

Write your content here...

## Your Section 2

More content...

## Reflections

What you learned...

---

*A closing thought or quote*`,
    date: '2024-10-11',
    readTime: '8 min read',
    tags: ['Life Story', 'Tag1', 'Tag2'],
    image: '/book/chapter-X.jpg', // Optional
    author: 'Yash Siwach',
    published: true, // Set to false to keep as draft
  },
  */
];

export function getBookPosts(): BookPost[] {
  return bookPosts
    .filter(post => post.published)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export function getBookPost(slug: string): BookPost | undefined {
  return bookPosts.find(post => post.slug === slug && post.published);
}

export function getBookPostsByTag(tag: string): BookPost[] {
  return bookPosts
    .filter(post => post.published && post.tags.includes(tag))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}
