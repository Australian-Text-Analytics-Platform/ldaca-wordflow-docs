<!-- markdownlint-disable MD033 -->

<h1 id="info-general-overview">About Wordflow</h1>

Wordflow is a web-based platform that helps you explore and analyse text collections. You can upload your own text files or use sample datasets, then apply a range of analysis tools — such as word frequency counts, topic discovery, concordance searches, and quotation extraction — all from a single interface.

Your work is organised into **workspaces**. Each workspace keeps your uploaded data, processed results, and derived outputs together so you can pick up where you left off. Results from one tool can be fed directly into another, making it easy to combine different types of analysis.

**Multilingual support (v0.4).** Concordance, Token Frequency, Topic Modelling, and AI Annotation now work end-to-end with English, Japanese, Korean, Simplified and Traditional Chinese, Vietnamese, French, German, Spanish, Portuguese, Italian, and Indonesian. Each corpus is tagged with its language at import time, and analyses pick the appropriate tokeniser (Lindera for Japanese/Korean, Jieba for Chinese, whitespace+lowercase for English) and stopword list. Quotation Extraction remains English-only because the underlying rule-based model hard-codes English speech verbs and grammar.

No programming or command-line knowledge is required. The platform is designed for researchers across all disciplines.
