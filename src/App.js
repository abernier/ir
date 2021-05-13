import React from "react";
import Chart from "chart.js";
import qs from "qs";
import urlparse from "url-parse";
import copy from "clipboard-copy";
import "./styles.css";

import ir from "./ir.js";

export default function App() {
  const [revenues, setRevenues] = React.useState(0);

  const canvasRef = React.useRef(null);
  const chartRef = React.useRef(null);

  const myir = ir(+revenues);

  //
  // Instanciate the `chartRef` on componentDidMount
  //

  React.useEffect(() => {
    const query = qs.parse(window.location.search.substr(1));
    if ("revenues" in query) {
      setRevenues(+query.revenues);
    }

    const ctx = canvasRef?.current?.getContext("2d");
    if (ctx) {
      // console.log("hey ctx");

      //
      // create labels and data
      //

      let labels = [];
      let data = [];

      for (let i = 0; i <= 200000; i += 5000) {
        labels.push(i);
        data.push((100 * ir(i)) / (i + 0.0000001));
      }
      // console.log(labels, data);

      //
      // Create chart
      //

      chartRef.current = new Chart(ctx, {
        type: "bar",
        data: {
          labels,
          datasets: [
            {
              data,
              type: "line",
              pointRadius: 0,
              order: 1
            },
            {
              data: [],
              backgroundColor: "rgba(255, 99, 132, 0.7)", // red
              order: 2
            }
          ]
        },
        options: {
          animation: false,
          legend: {
            display: false // no legend
          },
          scales: {
            xAxes: [{ display: false }], // don't display x axis
            yAxes: [{ display: false }] // don't display y axis
          }
        }
      });
    }
  }, []);

  //
  // Update the chart when revenues change
  //

  React.useEffect(() => {
    //
    // Upadte the ?revenues query-string param
    //

    const query = qs.parse(window.location.search.substr(1));
    query.revenues = revenues;

    const u = urlparse(window.location.href);
    u.query = query;

    window.history.replaceState(null, "", u.toString());

    //
    // update the 2nd dataset (red bar)
    //

    if (chartRef.current) {
      // console.log("hey chart", chartRef.current);

      let labels = chartRef.current.data.labels;
      let data = chartRef.current.data.datasets[0].data;

      chartRef.current.data.datasets[1].data = data.map((x, i) => {
        if (revenues >= labels[i] && revenues < (labels[i + 1] || Infinity)) {
          return data[i];
        }
        return 0;
      });
      chartRef.current.update();
    }
  }, [revenues]);

  //
  // template
  //

  return (
    <div className="App">
      <canvas width="400" height="300" ref={canvasRef} />
      <h1>
        <span style={{ fontSize: "150%", verticalAlign: "middle" }}>💰</span>{" "}
        Impôt sur le revenu
      </h1>
      <p>
        Cette année, je déclare{" "}
        <input
          type="number"
          step="1000"
          min="0"
          onChange={e => setRevenues(e.target.value)}
          value={revenues}
          style={{
            width: `${("" + revenues).split("").length + 1.5}ch`,
            minWidth: "6.5ch"
          }}
          autoFocus
        />
        {"€ "}
        de revenus.
      </p>
      {myir > 0 ? (
        <>
          <p>
            Je vais donc payer :{" "}
            <strong
              className="ir"
              onClick={function(e) {
                // e.persist(); // https://stackoverflow.com/questions/26317985/react-js-onclick-event-returning-all-null-values
                // console.log(e, e.innerText);
                copy(myir).catch(err =>
                  console.error("cannot copy to the clipboard", err)
                );
              }}
              title="Copier dans le presse-papier"
            >
              {new Intl.NumberFormat("fr-FR", {
                style: "currency",
                currency: "EUR",
                minimumFractionDigits: 0
              })
                .format(~~myir)
                .replace(/\s/g, " ")}
            </strong>{" "}
            d' IR.
            <br />
            <small>
              (soit{" "}
              <strong className="rate">
                {new Intl.NumberFormat("fr-FR", {
                  style: "percent",
                  minimumFractionDigits: 1
                }).format(myir / revenues)}
              </strong>{" "}
              de taux d'imposition)
            </small>
          </p>
        </>
      ) : (
        "Je ne paierai donc pas d'impôt !"
      )}
    </div>
  );
}
