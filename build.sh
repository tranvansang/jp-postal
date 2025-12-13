(
printf "module.exports = "
cat postal.json
) > index.cjs

(
printf "export default "
cat postal.json
) > index.mjs
