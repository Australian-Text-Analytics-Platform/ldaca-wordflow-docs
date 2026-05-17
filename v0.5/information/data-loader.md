<!-- markdownlint-disable MD033 -->

<h2 id="info-data-loader-overview">About the Data Loader</h2>

The Data Loader is where you start. Use it to create a workspace, upload your text files, and organise your data before running any analysis. You can also import sample datasets to try out the tools, or connect to the LDaCA repository to bring in existing collections.

**v0.4:** at upload time you also pick the **language** of the corpus (English, Japanese, Korean, Chinese, Vietnamese, French, German, Spanish, Portuguese, Italian, Indonesian, or *Other / Multilingual*). The language tag flows through every downstream analysis — Concordance, Token Frequency, Topic Modelling, AI Annotation — and gates which tokeniser, stopword list, and feature set is applied. Sample data is now loaded via a multi-collection **catalogue picker** instead of a single bulk-import button, so the install size of the app stays small.
