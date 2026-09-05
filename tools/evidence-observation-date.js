'use strict';

// Event dates may be forecasts. Only publication/observation fields can establish
// when evidence was available; missing dates remain unknown.
function firstEvidenceObservation(row, now = Date.now()) {
  const values = [row.firstSeenAt, row.signalObservedAt]
    .concat((row.sources || []).flatMap(source => [source.publishedAt, source.observedAt]));
  const valid = values.filter(value => typeof value === 'string')
    .map(value => Date.parse(value)).filter(value => Number.isFinite(value) && value <= now);
  return valid.length ? new Date(Math.min(...valid)).toISOString() : null;
}

module.exports = {firstEvidenceObservation};
