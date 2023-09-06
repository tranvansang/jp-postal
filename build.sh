(
echo -n "module.exports = "
cat postal.json
) > index.cjs

(
echo -n "export default "
cat postal.json
) > index.mjs
