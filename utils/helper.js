const cleanInput = (input) => {
	const value = ["undefined", "null"]
	if (value.includes(input)) {
		return undefined
	} else return input
}


module.exports = {cleanInput}