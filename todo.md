# Data Cleaning TODOs

- [ ] **Duplicate Header:** Identify and remove the duplicate header "Como você avalia a capacidade do colaborador de garantir que suas mensagens sejam compreendidas pelos outros? >> Daniel P." in the relevant source CSV file(s) within `data/` or the script generating them.
- [ ] **Inconsistent Ratings:** Standardize rating responses in relevant CSV file(s) in `data/` or processing script(s) in `src/` to use the consistent emoji format (❗, 🆗, 🎉), replacing text variations.
- [ ] **Inconsistent "Not Applicable":** Standardize 'Not Applicable' entries (e.g., "NA", "não se aplica") in relevant CSV file(s) in `data/` or processing script(s) in `src/` to a single consistent format (e.g., "Não se aplica").
- [ ] **Empty Responses:** Investigate and handle empty response fields in relevant CSV file(s) in `data/`. Ensure processing scripts in `src/` handle potential empty values correctly.
- [ ] **Non-standard Rating:** Locate and correct the non-standard rating "Precisa melhorar" (found in the technical expertise section) in the relevant CSV file(s) in `data/` to align with the standard emoji format.
- [ ] **Non-standard Marks:** Convert non-standard marks ('x', 'X') found in multiple-choice sections of relevant CSV file(s) in `data/` to a clear and consistent format (e.g., boolean TRUE/FALSE or standard selection text).
- [ ] **Name Capitalization:** Standardize the name format for "Daniel P." consistently across relevant CSV file(s) in `data/`.
