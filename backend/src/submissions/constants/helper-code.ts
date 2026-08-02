import { Language } from "../../ai/types/index.js";

export const HELPER_CODE: Record<Language, string> = {
  [Language.CPP]: `#include <bits/stdc++.h>\nusing namespace std;\n\n`,
  [Language.JAVASCRIPT]: "",
  [Language.PYTHON]: "",
  [Language.JAVA]: `import java.util.*;\nimport java.io.*;\n\n`,
};
