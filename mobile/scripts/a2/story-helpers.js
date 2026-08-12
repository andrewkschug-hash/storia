function N(text, english, phrases) {
  return { text, english, phrases };
}
function D(speaker, text, english, phrases) {
  return { speaker, text, english, phrases };
}
function PH(surface, literalEn, naturalEn) {
  return { surface, literalEn, naturalEn };
}
function Q(type, question, choices, correctChoice, explanation, difficulty = 2) {
  return { type, question, choices, correctChoice, explanation, difficulty };
}

module.exports = { N, D, PH, Q };
