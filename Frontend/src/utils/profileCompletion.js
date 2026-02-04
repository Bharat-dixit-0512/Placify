const getProfileCompletion = (user) => {
  if (!user) return { percent: 0, missing: [] }
  const fields = [
    { key: "name", label: "Name" },
    { key: "branch", label: "Branch" },
    { key: "year", label: "Year" },
    { key: "rollNumber", label: "Roll number" },
    { key: "graduationYear", label: "Graduation year" },
    { key: "bio", label: "Bio" }
  ]
  const missing = fields.filter((f) => !user[f.key])
  const percent = Math.round(((fields.length - missing.length) / fields.length) * 100)
  return { percent, missing: missing.map((m) => m.label) }
}

export { getProfileCompletion }
