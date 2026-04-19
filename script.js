const envelope = document.getElementById("envelope-container");
const letter = document.getElementById("letter-container");

const yesBtn = document.querySelector(".yes-btn");
const noBtn = document.querySelector(".no-btn");

const title = document.getElementById("letter-title");
const cat = document.getElementById("letter-cat");
const buttons = document.getElementById("letter-buttons");
const finalText = document.getElementById("final-text");

let historyStack = [];
let currentDate = new Date();
let moods = {};

function navigate(fn) {
  historyStack.push(fn);
  fn();
}

function goBack() {
  if (historyStack.length > 1) {
    historyStack.pop();
    const prev = historyStack[historyStack.length - 1];
    prev();
  }
}

/* Open envelope */
envelope.onclick = () => {
  envelope.style.display = "none";
  letter.style.display = "flex";

  setTimeout(() => {
    document.querySelector(".letter-window").classList.add("open");
  }, 50);
};

/* No button escape */
function moveNoButton() {
  const x = Math.random() * 320 - 160;
  const y = Math.random() * 220 - 110;
  noBtn.style.transition = "transform 0.05s linear";
  noBtn.style.transform = `translate(${x}px, ${y}px)`;
}

noBtn.addEventListener("mouseenter", moveNoButton);
noBtn.addEventListener("pointerenter", moveNoButton);
noBtn.addEventListener("pointerdown", moveNoButton);
noBtn.addEventListener("touchstart", moveNoButton, { passive: true });

/* Yes click */
yesBtn.onclick = () => {
  title.textContent = "Yippeeee!";
  cat.src = "cat_dance.gif";
  buttons.style.display = "none";
  finalText.style.display = "block";

  setTimeout(() => {
    historyStack = [];
    navigate(showHub);
  }, 1800);
};

/* Hub */
function showHub() {
  const win = document.querySelector(".letter-window");

  win.innerHTML = `
    <button class="back-btn" onclick="goBack()">← Back</button>

    <h1 class="hub-title">Our Little World ♡</h1>

    <div class="hub-intro">
      <img src="cat_dance.gif" class="hub-cat" alt="cat dance">
      <p class="hub-note">Sabhyataa, I love you alot ♡</p>
    </div>

    <div class="hub-grid">
      <div class="hub-card" onclick="navigate(showPhotos)">📸 Memories</div>
      <div class="hub-card" onclick="navigate(showCalendar)">📅 Calendar</div>
      <div class="hub-card" onclick="navigate(showLetters)">💌 Letters</div>
    </div>
  `;
}

/* Memories */
function showPhotos() {
  const win = document.querySelector(".letter-window");

  win.innerHTML = `
    <button class="back-btn" onclick="goBack()">← Back</button>

    <div class="memory-board">
      <div class="memory-title">Our memories</div>
      <div id="photo-container"></div>
    </div>
  `;

  const container = document.getElementById("photo-container");

  const photos = [
    "photo1.jpg",
    "photo2.jpg",
    "photo3.jpg",
    "photo4.jpg",
    "photo5.jpg"
  ];

  const slots = [
    { top: 8, left: 8 },
    { top: 10, left: 62 },
    { top: 44, left: 14 },
    { top: 54, left: 60 },
    { top: 28, left: 36 }
  ];

  photos.forEach((src, i) => {
    const img = document.createElement("img");
    img.src = src;
    img.className = "memory-photo";

    const base = slots[i % slots.length];
    const jitterTop = (Math.random() * 12) - 6;
    const jitterLeft = (Math.random() * 12) - 6;
    const rotate = (Math.random() * 28) - 14;

    img.style.top = "50%";
    img.style.left = "50%";
    img.style.transform = "translate(-50%, -50%) scale(0.92)";
    img.style.zIndex = String(i + 1);

    container.appendChild(img);

    setTimeout(() => {
      img.style.top = `${Math.max(5, Math.min(80, base.top + jitterTop))}%`;
      img.style.left = `${Math.max(5, Math.min(80, base.left + jitterLeft))}%`;
      img.style.transform = `translate(-50%, -50%) rotate(${rotate}deg)`;
    }, 120 + i * 90);
  });
}

/* Calendar */
function showCalendar() {
  const win = document.querySelector(".letter-window");

  win.innerHTML = `
    <button class="back-btn" onclick="goBack()">← Back</button>

    <div class="calendar">
      <div class="cal-header">
        <button onclick="changeMonth(-1)">←</button>
        <span id="month-year"></span>
        <button onclick="changeMonth(1)">→</button>
      </div>

      <div id="calendar-grid"></div>
    </div>
  `;

  loadMoods();
}

function changeMonth(dir) {
  currentDate.setMonth(currentDate.getMonth() + dir);
  renderCalendar();
}

function renderCalendar() {
  const grid = document.getElementById("calendar-grid");
  const label = document.getElementById("month-year");
  if (!grid || !label) return;

  const y = currentDate.getFullYear();
  const m = currentDate.getMonth();

  label.textContent = currentDate.toLocaleString("default", {
    month: "long"
  }) + " " + y;

  grid.innerHTML = "";

  const first = new Date(y, m, 1).getDay();
  const days = new Date(y, m + 1, 0).getDate();
  const today = new Date();

  for (let i = 0; i < first; i++) {
    grid.innerHTML += `<div></div>`;
  }

  for (let d = 1; d <= days; d++) {
    const key = `${y}-${m}-${d}`;
    const mood = moods[key] || "";

    const isToday =
      d === today.getDate() &&
      m === today.getMonth() &&
      y === today.getFullYear();

    grid.innerHTML += `
      <div class="day ${isToday ? "today" : ""}" onclick="setMood('${key}')">
        <div class="day-num">${d}</div>
        <div class="mood">${mood}</div>
      </div>
    `;
  }
}

async function loadMoods() {
  try {
    if (!window.fb || !window.db) {
      moods = {};
      renderCalendar();
      return;
    }

    const snapshot = await fb.getDocs(fb.collection(db, "moods"));
    moods = {};

    snapshot.forEach((docSnap) => {
      moods[docSnap.id] = docSnap.data().text;
    });

    renderCalendar();
  } catch (err) {
    console.error("Failed to load moods:", err);
    renderCalendar();
  }
}

async function setMood(key) {
  const value = prompt("Write anything:");
  if (!value) return;

  moods[key] = value;
  renderCalendar();

  try {
    await fb.setDoc(fb.doc(db, "moods", key), {
      text: value,
      updatedAt: Date.now()
    });
  } catch (err) {
    console.error("Failed to save mood:", err);
  }
}

/* Letters */
function showLetters() {
  const win = document.querySelector(".letter-window");

  win.innerHTML = `
    <button class="back-btn" onclick="goBack()">← Back</button>

    <div class="letters-wrap">
      <div class="letter-item" onclick="openLetterAndPush('cry')">
        <div class="letter-text">Open when you want to cry</div>
      </div>

      <div class="letter-item" onclick="openLetterAndPush('miss')">
        <div class="letter-text">Open when you miss me</div>
      </div>

      <div class="letter-item" onclick="openLetterAndPush('distant')">
        <div class="letter-text">Open when I feel distant</div>
      </div>

      <div class="letter-item" onclick="openLetterAndPush('need')">
        <div class="letter-text">Open when you need me</div>
      </div>

      <div class="letter-item" onclick="openLetterAndPush('hug')">
        <div class="letter-text">Open when you need a hug</div>
      </div>
    </div>
  `;
}

function openLetterAndPush(type) {
  navigate(() => openLetter(type));
}

function openLetter(type) {
      const messages = {
        cry: "Hi Sabhayata if you are opning this iam assuming you are crying and it is okay to cry baby mera baccha i know things are hard i know i might have done something i know myself but dont cry you worth more than anything to me and even in future iam acting like a jerk dont give up on me baby scold me beat me hold me cause ill change my self rather than leaving you i love you more than myself my love of life meri jaan dont cry sab kuch theek hai idhar aayo ill give you all the love you want ~ <33",
        miss: "I miss you too, Sabhyata, more than I can explain properly—it’s strange how everything feels slightly off when you’re not around, like the day is just running but not really happening, and I keep thinking about the little things, your voice, the way you talk, the comfort I feel when you’re just there, it stays in my head longer than I expect, because I don’t just miss talking to you, I miss you—your presence, your energy, the way you make things feel lighter without even trying, and even though it’s hard sometimes, it reminds me how real this is for me, because you matter to me more than I usually say.",
        distant: "I know it might feel like there’s some distance between us right now, and I hate that you’re feeling that way, because the truth is I don’t feel distant from you at all—you’re still on my mind in the same way, still someone I care about deeply, and even if things seem a little off or less expressive at times, it’s not because I’ve pulled away, it’s just life getting messy sometimes, but what I feel for you hasn’t changed, not even a little, and I don’t want you to ever feel alone in this, because I’m still right here, with you, trying, caring, and wanting us to feel close again like we always do.",
        need: "You have meI know there will be times when I’m not around and you might need me, and I hate that I won’t always be there in that exact moment, but I want you to remember this—just because I’m not there physically or replying instantly doesn’t mean I’m not with you, because you’re always on my mind, and whatever you’re going through, you don’t have to face it alone, I’m still yours, still caring, still someone you can come back to, and I’ll always listen, always understand, and always be there for you the moment I can..",
        
    };

  document.querySelector(".letter-window").innerHTML = `
    <button class="back-btn" onclick="goBack()">← Back</button>

    <div class="paper">
      <p>${messages[type]}</p>
    </div>
  `;
}