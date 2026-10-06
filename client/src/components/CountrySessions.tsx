import type { CountrySessionsResponse } from "../types";
import { formatNumber, formatPercent } from "../utils/format";

type CountrySessionsProps = {
  data: CountrySessionsResponse;
};

export function CountrySessions({ data }: CountrySessionsProps) {
  const topCountries = data.countries.slice(0, 4);

  return (
    <section className="card country-card">
      <div className="card-heading compact">
        <div>
          <p className="eyebrow">Local Overview</p>
          <h2>{data.title}</h2>
        </div>
        <strong>{formatNumber(data.totalSessions)}</strong>
      </div>

      <div className="map-card" aria-hidden="true">
        <span className="map-blob north-america" />
        <span className="map-blob europe" />
        <span className="map-blob asia" />
        <span className="map-blob australia" />
        <span className="map-blob south-america" />
      </div>

      <div className="country-list">
        {topCountries.map((country) => (
          <div key={country.code} className="country-row">
            <span>{country.country}</span>
            <div className="country-bar">
              <span style={{ width: `${Math.min(100, country.percentage * 4)}%` }} />
            </div>
            <strong>{formatPercent(country.percentage)}</strong>
          </div>
        ))}
      </div>
    </section>
  );
}
