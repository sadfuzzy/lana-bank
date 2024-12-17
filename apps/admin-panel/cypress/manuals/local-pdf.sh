for file in *.md; do
    cat > temp.css << 'EOL'
body {
    width: 100%;
    margin: 0;
    padding: 10mm;
    font-family: "Helvetica Neue", Helvetica, Arial, sans-serif;
    line-height: 1.6;
    font-size: 16px;
    word-wrap: break-word;
    overflow-wrap: break-word;
    hyphens: auto;
}
img {
    display: block;
    width: 100%;
    max-height: 80vh;
    object-fit: contain;
    margin: 15px auto;
}
.page {
    width: 100%;
    max-width: none;
    margin: 0 auto;
    box-sizing: border-box;
}
figure {
    margin: 0;
    padding: 0;
    text-align: center;
}
figcaption {
    text-align: center;
    margin: 10px 0;
}
p {
    margin: 1em 0;
    max-width: 100%;
    box-sizing: border-box;
    word-break: normal;
    overflow-wrap: anywhere;
}
p:has(img) {
    margin: 0;
    padding: 0;
    text-align: center;
}
p img + em {
    display: block;
    text-align: center;
    margin-top: 5px;
}
h1, h2, h3, h4, h5, h6 {
    line-height: 1.4;
    max-width: 100%;
    box-sizing: border-box;
    word-break: normal;
    overflow-wrap: anywhere;
}
* {
    max-width: 100%;
    box-sizing: border-box;
}
EOL
    pandoc "$file" \
        -o "results/${file%.md}.pdf" \
        --pdf-engine=wkhtmltopdf \
        --pdf-engine-opt=--enable-local-file-access \
        --pdf-engine-opt=--print-media-type \
        --pdf-engine-opt=--no-stop-slow-scripts \
        -V papersize=a4 \
        --css temp.css \
        -V margin-top=10mm \
        -V margin-right=15mm \
        -V margin-bottom=10mm \
        -V margin-left=15mm
    echo "Converted $file to results/${file%.md}.pdf"
done
rm temp.css