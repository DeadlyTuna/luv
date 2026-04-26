import { useState, useRef, useEffect } from 'react'

const STORY = {
  start: {
    sender: 'harsh',
    text: 'Hey Cherry... 🌸',
    delay: 1000,
    next: 'msg2',
  },
  msg2: {
    sender: 'harsh',
    text: "I've been thinking about something all day...",
    delay: 2000,
    next: 'msg3',
  },
  msg3: {
    sender: 'harsh',
    text: "Do you remember the first thing I ever said to you?",
    delay: 2500,
    choices: [
      { text: "Of course I do! 😊", next: 'path_a1' },
      { text: "Hmm... remind me? 🤔", next: 'path_b1' },
      { text: "Was it something embarrassing? 😂", next: 'path_c1' },
    ],
  },
  path_a1: {
    sender: 'harsh',
    text: "I knew you would 💕 You remember everything. That's one of the reasons I fell for you.",
    delay: 2000,
    next: 'merge1',
  },
  path_b1: {
    sender: 'harsh',
    text: "Haha okay honestly... I don't even remember exactly what I said 😂 I was too nervous. All I remember is how you made me feel.",
    delay: 2500,
    next: 'merge1',
  },
  path_c1: {
    sender: 'harsh',
    text: "LOL probably 😂 Everything I do around you is a little embarrassing because my brain stops working when you smile.",
    delay: 2500,
    next: 'merge1',
  },
  merge1: {
    sender: 'harsh',
    text: "But you know what's crazy? It's only been 2 months...",
    delay: 2000,
    next: 'merge2',
  },
  merge2: {
    sender: 'harsh',
    text: "...and you already feel like home to me.",
    delay: 2000,
    choices: [
      { text: "Stop, you're making me blush 🥺", next: 'path_d1' },
      { text: "You feel like home to me too ❤️", next: 'path_e1' },
      { text: "Only 2 months? Feels like forever 🥹", next: 'path_f1' },
    ],
  },
  path_d1: {
    sender: 'harsh',
    text: "Good. You should blush. Because you're literally the prettiest person alive and I need you to know that.",
    delay: 2500,
    next: 'merge3',
  },
  path_e1: {
    sender: 'harsh',
    text: "See... that's exactly why I love you. You always know how to make my heart do that stupid flipping thing. 💖",
    delay: 2500,
    next: 'merge3',
  },
  path_f1: {
    sender: 'harsh',
    text: "RIGHT? Like how do 2 months feel like a whole lifetime of knowing someone? That's how I know this is real.",
    delay: 2500,
    next: 'merge3',
  },
  merge3: {
    sender: 'harsh',
    text: "I have a question for you though. And be honest.",
    delay: 2000,
    next: 'merge4',
  },
  merge4: {
    sender: 'harsh',
    text: "On a scale of 1 to 10... how much do you love me? 👀",
    delay: 2500,
    choices: [
      { text: "11 💕", next: 'path_g1' },
      { text: "Infinity ♾️", next: 'path_h1' },
      { text: "More than pizza 🍕❤️", next: 'path_i1' },
    ],
  },
  path_g1: {
    sender: 'harsh',
    text: "11?! You broke the scale for me? 🥺 Okay fine, mine is 11.5 then. I always have to one-up you 😏",
    delay: 2500,
    next: 'finale1',
  },
  path_h1: {
    sender: 'harsh',
    text: "Infinity... I literally got goosebumps reading that. How are you so perfect? 🥺💖",
    delay: 2500,
    next: 'finale1',
  },
  path_i1: {
    sender: 'harsh',
    text: "MORE THAN PIZZA?! Okay that's literally the highest compliment in existence. I'm screenshotting this. 📸😂❤️",
    delay: 2500,
    next: 'finale1',
  },
  finale1: {
    sender: 'harsh',
    text: "Cherry, I just want you to know...",
    delay: 2000,
    next: 'finale2',
  },
  finale2: {
    sender: 'harsh',
    text: "Every single day with you is a gift. Every laugh, every silence, every random 2 AM conversation.",
    delay: 3000,
    next: 'finale3',
  },
  finale3: {
    sender: 'harsh',
    text: "Happy 2 months, my love. Here's to a thousand more. 💖🌸✨",
    delay: 3000,
    next: null,
  },
}

function TypingIndicator() {
  return (
    <div className="chat-typing">
      <div className="chat-avatar">H</div>
      <div className="chat-typing-bubble">
        <span className="chat-typing-dot" />
        <span className="chat-typing-dot" />
        <span className="chat-typing-dot" />
      </div>
    </div>
  )
}

export default function ChatStory() {
  const [messages, setMessages] = useState([])
  const [currentNode, setCurrentNode] = useState(null)
  const [typing, setTyping] = useState(false)
  const [choices, setChoices] = useState(null)
  const [started, setStarted] = useState(false)
  const [finished, setFinished] = useState(false)
  const scrollRef = useRef(null)

  const scrollToBottom = () => {
    setTimeout(() => {
      if (scrollRef.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight
      }
    }, 100)
  }

  const playNode = (nodeKey) => {
    const node = STORY[nodeKey]
    if (!node) { setFinished(true); return }

    setCurrentNode(nodeKey)
    setTyping(true)
    setChoices(null)

    setTimeout(() => {
      setTyping(false)
      setMessages(prev => [...prev, { sender: node.sender, text: node.text }])
      scrollToBottom()

      if (node.choices) {
        setTimeout(() => {
          setChoices(node.choices)
          scrollToBottom()
        }, 800)
      } else if (node.next) {
        setTimeout(() => playNode(node.next), 1200)
      } else {
        setFinished(true)
      }
    }, node.delay || 1500)
  }

  const handleChoice = (choice) => {
    setMessages(prev => [...prev, { sender: 'her', text: choice.text }])
    setChoices(null)
    scrollToBottom()
    setTimeout(() => playNode(choice.next), 1000)
  }

  const startChat = () => {
    setStarted(true)
    setTimeout(() => playNode('start'), 800)
  }

  return (
    <section className="chat-story-section">
      <div className="chat-phone">
        {/* Phone header */}
        <div className="chat-phone-header">
          <div className="chat-phone-avatar">H</div>
          <div className="chat-phone-info">
            <div className="chat-phone-name">Harsh ❤️</div>
            <div className="chat-phone-status">
              {typing ? 'typing...' : finished ? 'offline' : 'online'}
            </div>
          </div>
          <div className="chat-phone-time">
            {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>

        {/* Messages */}
        <div className="chat-messages" ref={scrollRef}>
          {!started && (
            <div className="chat-start-prompt">
              <div className="chat-start-emoji">💬</div>
              <div className="chat-start-text">You have a new message</div>
              <button className="chat-start-btn" onClick={startChat} id="chatStartBtn">
                Open conversation
              </button>
            </div>
          )}

          {messages.map((msg, i) => (
            <div key={i} className={`chat-bubble ${msg.sender === 'her' ? 'sent' : 'received'}`}>
              {msg.sender !== 'her' && <div className="chat-avatar">H</div>}
              <div className="chat-bubble-text">{msg.text}</div>
            </div>
          ))}

          {typing && <TypingIndicator />}

          {choices && (
            <div className="chat-choices">
              {choices.map((c, i) => (
                <button
                  key={i}
                  className="chat-choice-btn"
                  onClick={() => handleChoice(c)}
                >
                  {c.text}
                </button>
              ))}
            </div>
          )}

          {finished && (
            <div className="chat-finale">
              <div className="chat-finale-hearts">💖💖💖</div>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
