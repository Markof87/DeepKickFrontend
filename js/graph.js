// Dati per il grafico a barre
const data = [
    { name: "Team A", value: 30 },
    { name: "Team B", value: 80 },
    { name: "Team C", value: 45 },
    { name: "Team D", value: 60 },
    { name: "Team E", value: 20 },
    { name: "Team F", value: 90 },
    { name: "Team G", value: 55 }
];

// Dimensioni del grafico
const width = 600;
const height = 400;
const margin = { top: 20, right: 30, bottom: 40, left: 50 };

// Crea il contenitore SVG
const svg = d3.select("#barChart")
    .attr("width", width)
    .attr("height", height);

// Scala per l'asse X
const x = d3.scaleBand()
    .domain(data.map(d => d.name))
    .range([margin.left, width - margin.right])
    .padding(0.1);

// Scala per l'asse Y
const y = d3.scaleLinear()
    .domain([0, d3.max(data, d => d.value)])
    .nice()
    .range([height - margin.bottom, margin.top]);

// Aggiungi un gruppo per le barre
const bars = svg.selectAll(".bar")
    .data(data)
    .enter().append("rect")
    .attr("class", "bar")
    .attr("x", d => x(d.name))
    .attr("y", height - margin.bottom) // Partenza animazione
    .attr("height", 0) // Partenza animazione
    .attr("width", x.bandwidth())
    .attr("fill", "#00d4ff")
    .on("mouseover", function (event, d) {
        tooltip.style("opacity", 1)
            .html(`<strong>${d.name}</strong><br>Valore: ${d.value}`)
            .style("left", `${event.pageX + 10}px`)
            .style("top", `${event.pageY - 20}px`);
        d3.select(this).attr("fill", "#00b3cc"); // Cambia colore al passaggio del mouse
    })
    .on("mouseout", function () {
        tooltip.style("opacity", 0);
        d3.select(this).attr("fill", "#00d4ff"); // Ripristina colore originale
    });

// Aggiungi animazione alle barre
bars.transition()
    .duration(800)
    .attr("y", d => y(d.value))
    .attr("height", d => y(0) - y(d.value))
    .delay((d, i) => i * 100); // Ritardo per ogni barra

// Aggiungi l'asse X
svg.append("g")
    .attr("transform", `translate(0,${height - margin.bottom})`)
    .call(d3.axisBottom(x))
    .selectAll("text")
    .attr("transform", "rotate(-45)")
    .style("text-anchor", "end")
    .style("fill", "#e3e3e3");

// Aggiungi l'asse Y
svg.append("g")
    .attr("transform", `translate(${margin.left},0)`)
    .call(d3.axisLeft(y))
    .selectAll("text")
    .style("fill", "#e3e3e3");

// Aggiungi etichette
svg.selectAll(".label")
    .data(data)
    .enter().append("text")
    .attr("class", "label")
    .attr("x", d => x(d.name) + x.bandwidth() / 2)
    .attr("y", d => y(d.value) - 5)
    .attr("text-anchor", "middle")
    .text(d => d.value)
    .style("fill", "#e3e3e3");

// Crea il tooltip
const tooltip = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("position", "absolute")
    .style("background-color", "#2a2a3b")
    .style("color", "#e3e3e3")
    .style("padding", "8px")
    .style("border-radius", "4px")
    .style("box-shadow", "0px 0px 10px rgba(0, 0, 0, 0.5)")
    .style("opacity", 0)
    .style("pointer-events", "none");