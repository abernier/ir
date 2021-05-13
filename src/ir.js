// source : https://s3-us-west-2.amazonaws.com/s.cdpn.io/67030/impots.jpg
// source a date 2020 : https://www.economie.gouv.fr/particuliers/tranches-imposition-impot-revenu
const tranches = {
  0: 10064,
  0.14: 25659,
  0.3: 73769,
  0.41: 157806,
  0.45: Infinity
};

function ir(x) {
  const keys = Object.keys(tranches);

  return keys.reduce((acc, curr, index) => {
    const currTrancheVal = tranches[curr]; // 9964
    const nextTrancheKey = keys[Math.min(index + 1, keys.length - 1)]; // "0.14"
    const nextTrancheVal = tranches[nextTrancheKey]; // 27519

    const delta = Math.min(x, nextTrancheVal) - currTrancheVal;

    return acc + (delta < 0 ? 0 : delta) * Number(nextTrancheKey);
  }, 0);
}

export { tranches };
export default ir;
