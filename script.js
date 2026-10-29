
const dictionaryDefaults = {
  "学习": "học tập",
  "语言": "ngôn ngữ",
  "新的": "mới",
  "需要": "cần, cần phải",
  "时间": "thời gian",
  "耐心": "sự kiên nhẫn",
  "每天": "mỗi ngày",
  "坚持": "kiên trì",
  "阅读": "đọc",
  "不但": "không những",
  "可以": "có thể",
  "增加": "tăng thêm",
  "词汇量": "vốn từ vựng",
  "还能": "còn có thể",
  "帮助": "giúp đỡ",
  "我们": "chúng ta, chúng tôi",
  "了解": "tìm hiểu, hiểu rõ",
  "不同": "khác nhau",
  "文化": "văn hóa",
  "因为": "bởi vì",
  "所以": "cho nên",
  "虽然": "mặc dù",
  "但是": "nhưng",
  "如果": "nếu",
  "发现": "phát hiện",
  "机会": "cơ hội",
  "生活": "cuộc sống, sinh hoạt",
  "工作": "công việc, làm việc",
  "问题": "vấn đề, câu hỏi",
  "解决": "giải quyết",
  "重要": "quan trọng",
  "影响": "ảnh hưởng",
  "习惯": "thói quen",
  "环境": "môi trường",
  "社会": "xã hội",
  "提高": "nâng cao",
  "经验": "kinh nghiệm",
  "选择": "lựa chọn",
  "成功": "thành công",
  "努力": "nỗ lực",
  "认真": "nghiêm túc, chăm chỉ",
  "特别": "đặc biệt",
  "认为": "cho rằng",
  "觉得": "cảm thấy, cho rằng",
  "应该": "nên",
  "必须": "bắt buộc phải",
  "已经": "đã",
  "经常": "thường xuyên",
  "越来越": "ngày càng",
  "除了": "ngoài ra, ngoại trừ",
  "例如": "ví dụ",
  "首先": "trước hết",
  "其次": "tiếp theo",
  "最后": "cuối cùng",
  "因此": "vì vậy",
  "总之": "tóm lại",
  "中文": "tiếng Trung",
  "中国": "Trung Quốc",
  "朋友": "bạn bè",
  "事情": "sự việc",
  "自己": "bản thân",
  "别人": "người khác",
  "时候": "lúc, thời điểm",
  "地方": "nơi, địa điểm",
  "开始": "bắt đầu",
  "结束": "kết thúc",
  "准备": "chuẩn bị",
  "参加": "tham gia",
  "办法": "cách, biện pháp",
  "原因": "nguyên nhân",
  "结果": "kết quả",
  "关系": "mối quan hệ",
  "一般": "thông thường",
  "当然": "đương nhiên",
  "其实": "thực ra",
  "终于": "cuối cùng cũng",
  "马上": "ngay lập tức",
  "只要": "chỉ cần",
  "即使": "cho dù",
  "无论": "bất kể",
  "而且": "hơn nữa",
  "不过": "tuy nhiên",
  "或者": "hoặc",
  "同时": "đồng thời",
  "比如": "ví dụ như",
  "能力": "năng lực",
  "知识": "kiến thức",
  "健康": "sức khỏe, khỏe mạnh",
  "锻炼": "rèn luyện, tập thể dục",
  "放松": "thư giãn",
  "压力": "áp lực",
  "开心": "vui vẻ",
  "担心": "lo lắng",
  "相信": "tin tưởng",
  "理解": "hiểu, thông cảm",
  "尊重": "tôn trọng",
  "保护": "bảo vệ",
  "自然": "tự nhiên",
  "经济": "kinh tế",
  "发展": "phát triển",
  "科技": "khoa học công nghệ",
  "网络": "mạng Internet",
  "信息": "thông tin",
  "内容": "nội dung",
  "表达": "biểu đạt, diễn đạt",
  "意思": "ý nghĩa"
};

const STORAGE_KEY = "hsk5-personal-dictionary-v1";

function loadPersonalDictionary() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
    return { ...dictionaryDefaults, ...saved };
  } catch {
    return { ...dictionaryDefaults };
  }
}

let personalDictionary = loadPersonalDictionary();
let mainWriter = null;
let tooltipWriter = null;
let selectedWord = "";
let lastTooltipWord = "";
let hoverSpeakTimer = null;

const chineseInput = document.getElementById("chineseInput");
const readingText = document.getElementById("readingText");
const wordCount = document.getElementById("wordCount");
const wordTooltip = document.getElementById("wordTooltip");
const tooltipWord = document.getElementById("tooltipWord");
const tooltipPinyin = document.getElementById("tooltipPinyin");
const tooltipMeaning = document.getElementById("tooltipMeaning");
const newWord = document.getElementById("newWord");
const newMeaning = document.getElementById("newMeaning");
const dictionaryStatus = document.getElementById("dictionaryStatus");
const characterInput = document.getElementById("characterInput");
const writingStatus = document.getElementById("writingStatus");

function isChineseCharacter(character) {
  return /[\u3400-\u4DBF\u4E00-\u9FFF\uF900-\uFAFF]/u.test(character);
}

function getPinyin(word) {
  try {
    if (window.pinyinPro && typeof window.pinyinPro.pinyin === "function") {
      return window.pinyinPro.pinyin(word, {
        toneType: "symbol",
        type: "string"
      });
    }
  } catch (error) {
    console.error("Lỗi tạo pinyin:", error);
  }

  return "Chưa tải được pinyin";
}

function savePersonalDictionary() {
  try {
    const customWords = {};

    for (const [word, meaning] of Object.entries(personalDictionary)) {
      if (
        !Object.prototype.hasOwnProperty.call(dictionaryDefaults, word) ||
        dictionaryDefaults[word] !== meaning
      ) {
        customWords[word] = meaning;
      }
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(customWords));
    return true;
  } catch (error) {
    console.error("Không lưu được từ điển:", error);
    return false;
  }
}

function getDictionaryWords() {
  return Object.keys(personalDictionary)
    .filter(word => word.length > 0)
    .sort((a, b) => b.length - a.length);
}

function findWordAt(text, index, dictionaryWords) {
  for (const word of dictionaryWords) {
    if (text.startsWith(word, index)) {
      return word;
    }
  }

  return Array.from(text.slice(index))[0] || "";
}

function renderReading() {
  const text = chineseInput.value.trim();

  readingText.replaceChildren();
  wordTooltip.hidden = true;
  lastTooltipWord = "";

  if (!text) {
    readingText.textContent = "Hãy dán đoạn văn tiếng Trung vào ô bên trái.";
    wordCount.textContent = "0 ký tự";
    return;
  }

  const fragment = document.createDocumentFragment();
  const dictionaryWords = getDictionaryWords();
  let index = 0;

  while (index < text.length) {
    const character = Array.from(text.slice(index))[0];

    if (!isChineseCharacter(character)) {
      fragment.appendChild(document.createTextNode(character));
      index += character.length;
      continue;
    }

    const word = findWordAt(text, index, dictionaryWords);
    const span = document.createElement("span");

    span.className = "word";
    span.textContent = word;
    span.tabIndex = 0;
    span.setAttribute("role", "button");
    span.setAttribute("aria-label", `Tra từ ${word}`);
    span.dataset.word = word;

    span.addEventListener("mouseenter", () => {
      showWordTooltip(word, span);
    });

    span.addEventListener("mouseleave", () => {
      clearTimeout(hoverSpeakTimer);
    });

    span.addEventListener("focus", () => {
      showWordTooltip(word, span);
    });

    span.addEventListener("click", () => {
      selectWord(word, span);
    });

    span.addEventListener("keydown", event => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        selectWord(word, span);
      }
    });

    fragment.appendChild(span);
    index += word.length;
  }

  readingText.appendChild(fragment);
  wordCount.textContent = `${Array.from(text).length} ký tự`;
}

function speakChinese(text) {
  if (!text || !("speechSynthesis" in window)) {
    return;
  }

  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "zh-CN";
  utterance.rate = 0.8;

  const voices = window.speechSynthesis.getVoices();
  const chineseVoice = voices.find(voice =>
    /^zh(-|_)/i.test(voice.lang)
  );

  if (chineseVoice) {
    utterance.voice = chineseVoice;
  }

  utterance.onerror = event => {
    console.warn("Không phát được âm thanh:", event.error);
  };

  window.speechSynthesis.speak(utterance);
}

function showTooltipWriting(word) {
  const target = document.getElementById("tooltipWriter");
  const label = document.getElementById("tooltipWritingLabel");

  if (!target || !window.HanziWriter) {
    if (label) {
      label.textContent = "Không tải được thư viện luyện viết.";
    }
    return;
  }

  const firstCharacter = Array.from(word).find(isChineseCharacter);

  if (!firstCharacter) {
    return;
  }

  target.replaceChildren();
  tooltipWriter = null;

  try {
    tooltipWriter = HanziWriter.create(target, firstCharacter, {
      width: 100,
      height: 100,
      padding: 7,
      showOutline: true,
      showCharacter: false,
      strokeAnimationSpeed: 1,
      delayBetweenStrokes: 300,
      strokeColor: "#a94335",
      outlineColor: "#ded5c7",
      highlightColor: "#d8b77c"
    });

    if (label) {
      label.textContent = `Thứ tự nét của chữ ${firstCharacter}`;
    }

    tooltipWriter.animateCharacter();
  } catch (error) {
    if (label) {
      label.textContent = "Chưa tải được dữ liệu nét của chữ này.";
    }

    console.error("Lỗi hoạt hình nét:", error);
  }
}

function showWordTooltip(word) {
  tooltipWord.textContent = word;
  tooltipPinyin.textContent = getPinyin(word);
  tooltipMeaning.textContent =
    personalDictionary[word] ||
    "Chưa có nghĩa tiếng Việt. Nhấp vào từ để bổ sung.";

  wordTooltip.hidden = false;

  if (word === lastTooltipWord) {
    return;
  }

  lastTooltipWord = word;

  clearTimeout(hoverSpeakTimer);

  hoverSpeakTimer = setTimeout(() => {
    speakChinese(word);
  }, 180);

  showTooltipWriting(word);
}

function selectWord(word, element) {
  selectedWord = word;

  document.querySelectorAll(".word.selected").forEach(item => {
    item.classList.remove("selected");
  });

  if (element) {
    element.classList.add("selected");
  }

  newWord.value = word;
  newMeaning.value = personalDictionary[word] || "";

  showWordTooltip(word);

  dictionaryStatus.textContent =
    `Đã chọn "${word}". Hãy nhập nghĩa tiếng Việt rồi nhấn Lưu từ vựng.`;
}

function renderSavedWords() {
  const savedWords = document.getElementById("savedWords");

  if (!savedWords) {
    return;
  }

  savedWords.replaceChildren();

  const entries = Object.entries(personalDictionary)
    .filter(([word, meaning]) => word && meaning)
    .sort(([a], [b]) => a.localeCompare(b, "zh-CN"));

  for (const [word, meaning] of entries) {
    const item = document.createElement("div");
    item.className = "saved-word";

    const strong = document.createElement("strong");
    strong.textContent = word;

    const pinyin = document.createElement("div");
    pinyin.className = "muted";
    pinyin.textContent = getPinyin(word);

    const meaningText = document.createElement("div");
    meaningText.textContent = meaning;

    item.append(strong, pinyin, meaningText);
    savedWords.appendChild(item);
  }
}

document.getElementById("renderBtn").addEventListener("click", renderReading);

document.getElementById("clearBtn").addEventListener("click", () => {
  chineseInput.value = "";
  renderReading();
  chineseInput.focus();
});

document.getElementById("saveWordBtn").addEventListener("click", () => {
  const word = newWord.value.trim();
  const meaning = newMeaning.value.trim();

  if (!word) {
    dictionaryStatus.textContent = "Hãy nhập từ tiếng Trung.";
    return;
  }

  if (!Array.from(word).every(isChineseCharacter)) {
    dictionaryStatus.textContent = "Từ cần lưu nên gồm các chữ Hán.";
    return;
  }

  if (!meaning) {
    dictionaryStatus.textContent = "Hãy nhập nghĩa tiếng Việt.";
    return;
  }

  personalDictionary[word] = meaning;

  const saved = savePersonalDictionary();

  renderReading();
  renderSavedWords();

  dictionaryStatus.textContent = saved
    ? `Đã lưu "${word}" – ${meaning}.`
    : "Từ đã được thêm tạm thời nhưng chưa lưu được vào trình duyệt.";
});

document.getElementById("speakBtn").addEventListener("click", () => {
  const text = chineseInput.value.trim();

  if (!text) {
    alert("Hãy nhập đoạn tiếng Trung trước.");
    return;
  }

  speakChinese(text);
});

document.getElementById("stopSpeakBtn").addEventListener("click", () => {
  if ("speechSynthesis" in window) {
    window.speechSynthesis.cancel();
  }
});

const tooltipSpeakBtn = document.getElementById("tooltipSpeakBtn");

if (tooltipSpeakBtn) {
  tooltipSpeakBtn.addEventListener("click", () => {
    speakChinese(tooltipWord.textContent);
  });
}

const tooltipReplayBtn = document.getElementById("tooltipReplayBtn");

if (tooltipReplayBtn) {
  tooltipReplayBtn.addEventListener("click", () => {
    if (tooltipWriter) {
      tooltipWriter.animateCharacter();
    } else if (tooltipWord.textContent) {
      showTooltipWriting(tooltipWord.textContent);
    }
  });
}

function initializeMainWriter(character) {
  const target = document.getElementById("hanziWriter");

  if (!target) {
    return;
  }

  if (!window.HanziWriter) {
    writingStatus.textContent =
      "Chưa tải được thư viện luyện viết. Hãy kiểm tra Internet.";
    return;
  }

  if (
    !character ||
    !isChineseCharacter(character) ||
    Array.from(character).length !== 1
  ) {
    writingStatus.textContent = "Vui lòng nhập đúng một chữ Hán.";
    return;
  }

  target.replaceChildren();
  mainWriter = null;

  try {
    mainWriter = HanziWriter.create(target, character, {
      width: 270,
      height: 270,
      padding: 18,
      showOutline: true,
      showCharacter: true,
      strokeAnimationSpeed: 1,
      delayBetweenStrokes: 450,
      strokeColor: "#a94335",
      outlineColor: "#e8dfd1",
      drawingColor: "#526b51",
      highlightColor: "#d8b77c"
    });

    writingStatus.textContent = `Đang học chữ ${character}.`;
  } catch (error) {
    writingStatus.textContent =
      "Không tải được dữ liệu của chữ này. Hãy thử chữ khác.";
    console.error(error);
  }
}

document.getElementById("showCharacterBtn").addEventListener("click", () => {
  initializeMainWriter(characterInput.value.trim());
});

document.getElementById("animateBtn").addEventListener("click", () => {
  const character = characterInput.value.trim();

  if (!mainWriter) {
    initializeMainWriter(character);
  }

  if (mainWriter) {
    mainWriter.cancelQuiz();
    mainWriter.setCharacter(character);
    mainWriter.animateCharacter();

    writingStatus.textContent = "Đang phát hoạt hình thứ tự từng nét.";
  }
});

document.getElementById("quizBtn").addEventListener("click", () => {
  const character = characterInput.value.trim();

  if (!mainWriter) {
    initializeMainWriter(character);
  }

  if (mainWriter) {
    mainWriter.cancelQuiz();
    mainWriter.setCharacter(character);

    mainWriter.quiz({
      onMistake: () => {
        writingStatus.textContent =
          "Nét chưa đúng. Hãy thử lại theo hướng dẫn.";
      },

      onCorrectStroke: data => {
        writingStatus.textContent =
          `Tốt lắm! Bạn còn ${data.strokesRemaining} nét.`;
      },

      onComplete: data => {
        writingStatus.textContent =
          `Hoàn thành chữ ${data.character}! Số lần viết sai: ${data.totalMistakes}.`;
      }
    });

    writingStatus.textContent = "Hãy viết chữ vào khung bên phải.";
  }
});

document.getElementById("resetWriterBtn").addEventListener("click", () => {
  initializeMainWriter(characterInput.value.trim());

  if (mainWriter) {
    mainWriter.animateCharacter();
  }
});

characterInput.addEventListener("keydown", event => {
  if (event.key === "Enter") {
    initializeMainWriter(characterInput.value.trim());
  }
});

renderReading();
renderSavedWords();
initializeMainWriter(characterInput.value.trim());
