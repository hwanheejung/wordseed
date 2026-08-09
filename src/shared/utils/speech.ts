function preferredEnglishVoice(voices: SpeechSynthesisVoice[]) {
  const englishVoices = voices.filter((voice) =>
    voice.lang.toLowerCase().startsWith("en"),
  );

  return englishVoices.sort((left, right) => {
    const score = (voice: SpeechSynthesisVoice) => {
      const name = voice.name.toLowerCase();

      return (
        (voice.lang.toLowerCase() === "en-us" ? 100 : 0) +
        (/samantha|alex|google us english|aria|jenny|guy/.test(name) ? 20 : 0) +
        (voice.localService ? 2 : 0)
      );
    };

    return score(right) - score(left);
  })[0];
}

export function speak(term: string) {
  if (!("speechSynthesis" in window)) return;

  const synthesis = window.speechSynthesis;
  let started = false;

  const start = () => {
    if (started) return;

    const voice = preferredEnglishVoice(synthesis.getVoices());
    if (!voice) {
      window.alert(
        "이 기기에 영어 음성이 설치되어 있지 않아요. 기기 설정에서 영어(미국) 음성을 추가해 주세요.",
      );

      return;
    }

    started = true;
    synthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(term);
    utterance.voice = voice;
    utterance.lang = voice.lang;
    utterance.rate = 0.82;
    synthesis.speak(utterance);
  };

  if (synthesis.getVoices().length) {
    start();

    return;
  }

  const handleVoicesChanged = () => {
    window.clearTimeout(fallbackTimer);
    start();
  };

  synthesis.addEventListener("voiceschanged", handleVoicesChanged, {
    once: true,
  });
  const fallbackTimer = window.setTimeout(() => {
    synthesis.removeEventListener("voiceschanged", handleVoicesChanged);
    start();
  }, 500);
}
