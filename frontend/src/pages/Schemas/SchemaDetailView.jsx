import React, { useState, useEffect } from 'react';
import { Icon } from '../../components/common/Icons.jsx';

export default function SchemaDetailView({
  schema,
  onUpdateSchemaDefinition,
  onDeleteSchema
}) {
  const [activeTab, setActiveTab] = useState('editor'); // 'editor' | 'fields' | 'sandbox'
  const [editableJson, setEditableJson] = useState(schema.jsonSchemaDefinition);
  const [jsonError, setJsonError] = useState('');
  const [copyNotice, setCopyNotice] = useState(false);
  const [saveNotice, setSaveNotice] = useState(false);

  // Sandbox state
  const [testPayload, setTestPayload] = useState(schema.samplePayload || '{\n  "key": "value"\n}');
  const [validationResult, setValidationResult] = useState(null);

  // Sync state whenever selected schema changes
  useEffect(() => {
    setEditableJson(schema.jsonSchemaDefinition);
    setTestPayload(schema.samplePayload || '{\n  "key": "value"\n}');
    setJsonError('');
    setValidationResult(null);
  }, [schema.id]);

  // Live syntax check
  const handleJsonChange = (val) => {
    setEditableJson(val);
    try {
      JSON.parse(val);
      setJsonError('');
    } catch (err) {
      setJsonError(err.message);
    }
  };

  const handleFormat = () => {
    try {
      const parsed = JSON.parse(editableJson);
      setEditableJson(JSON.stringify(parsed, null, 2));
      setJsonError('');
    } catch (err) {
      setJsonError(`Cannot format invalid JSON: ${err.message}`);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(editableJson);
    setCopyNotice(true);
    setTimeout(() => setCopyNotice(false), 2000);
  };

  const handleSave = () => {
    try {
      JSON.parse(editableJson);
      onUpdateSchemaDefinition(schema.id, editableJson);
      setSaveNotice(true);
      setTimeout(() => setSaveNotice(false), 2500);
    } catch (err) {
      setJsonError(`Cannot save: ${err.message}`);
    }
  };

  // Parse properties for the Field Contract tab
  let parsedProperties = [];
  let requiredFields = [];
  try {
    const parsed = JSON.parse(editableJson);
    if (parsed && parsed.properties) {
      requiredFields = Array.isArray(parsed.required) ? parsed.required : [];
      parsedProperties = Object.keys(parsed.properties).map((propName) => {
        const details = parsed.properties[propName];
        return {
          name: propName,
          type: details.type || 'any',
          isRequired: requiredFields.includes(propName),
          constraints: details.enum
            ? `Enum: [${details.enum.join(', ')}]`
            : details.minimum !== undefined
            ? `Min: ${details.minimum}`
            : details.minLength !== undefined
            ? `MinLength: ${details.minLength}`
            : '—'
        };
      });
    }
  } catch (e) {
    // Handled in JSON syntax checker
  }

  // Client-side Draft-7 validation runner for the Sandbox
  const handleRunValidation = () => {
    setValidationResult(null);
    let payloadObj;
    let schemaObj;

    try {
      payloadObj = JSON.parse(testPayload);
    } catch (err) {
      setValidationResult({
        valid: false,
        errors: [`Payload JSON syntax error: ${err.message}`]
      });
      return;
    }

    try {
      schemaObj = JSON.parse(editableJson);
    } catch (err) {
      setValidationResult({
        valid: false,
        errors: [`Schema definition is invalid JSON: ${err.message}`]
      });
      return;
    }

    const errors = [];

    // Check required fields
    if (Array.isArray(schemaObj.required)) {
      schemaObj.required.forEach((reqKey) => {
        if (payloadObj[reqKey] === undefined || payloadObj[reqKey] === null) {
          errors.push(`Required field missing: "${reqKey}"`);
        }
      });
    }

    // Check properties and simple types
    if (schemaObj.properties && typeof payloadObj === 'object') {
      Object.keys(payloadObj).forEach((key) => {
        const propRule = schemaObj.properties[key];
        const val = payloadObj[key];

        if (!propRule && schemaObj.additionalProperties === false) {
          errors.push(`Additional property "${key}" is not allowed by this schema.`);
          return;
        }

        if (propRule) {
          if (propRule.type === 'string' && typeof val !== 'string') {
            errors.push(`Property "${key}" expected string, got ${typeof val}.`);
          } else if (propRule.type === 'number' && typeof val !== 'number') {
            errors.push(`Property "${key}" expected number, got ${typeof val}.`);
          } else if (propRule.type === 'boolean' && typeof val !== 'boolean') {
            errors.push(`Property "${key}" expected boolean, got ${typeof val}.`);
          }

          if (propRule.minimum !== undefined && typeof val === 'number' && val < propRule.minimum) {
            errors.push(`Property "${key}" value ${val} is below minimum allowed value ${propRule.minimum}.`);
          }

          if (propRule.enum && !propRule.enum.includes(val)) {
            errors.push(`Property "${key}" value "${val}" must be one of [${propRule.enum.join(', ')}].`);
          }
        }
      });
    }

    if (errors.length > 0) {
      setValidationResult({ valid: false, errors });
    } else {
      setValidationResult({ valid: true, errors: [] });
    }
  };

  return (
    <div className="card" style={{ padding: '1.5rem' }}>
      {/* Header Info */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.35rem' }}>
            <span style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              {schema.eventType}
            </span>
            <span className="badge badge-cyan" style={{ fontSize: '0.75rem' }}>
              v{schema.schemaVersion}
            </span>
            <span className="badge badge-emerald" style={{ fontSize: '0.75rem' }}>
              {schema.status}
            </span>
            <span className="badge badge-neutral" style={{ fontSize: '0.75rem' }}>
              {schema.standard}
            </span>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.825rem', maxWidth: '600px' }}>
            {schema.description}
          </p>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button className="btn btn-secondary" onClick={handleFormat} title="Beautify JSON formatting">
            <Icon name="code" size={14} color="var(--accent-cyan)" />
            <span>Format</span>
          </button>
          <button className="btn btn-secondary" onClick={handleCopy} title="Copy JSON Schema to clipboard">
            <Icon name={copyNotice ? 'check' : 'copy'} size={14} color={copyNotice ? 'var(--accent-emerald)' : 'var(--text-secondary)'} />
            <span>{copyNotice ? 'Copied' : 'Copy'}</span>
          </button>
          <button className="btn btn-cyan" onClick={handleSave} title="Save local in-memory modifications">
            <Icon name="check" size={14} />
            <span>Save Mock Edits</span>
          </button>
          {onDeleteSchema && (
            <button
              className="btn btn-secondary"
              onClick={() => onDeleteSchema(schema.id)}
              style={{ color: 'var(--accent-rose)' }}
              title="Remove schema from local session"
            >
              <Icon name="trash" size={14} color="var(--accent-rose)" />
            </button>
          )}
        </div>
      </div>

      {saveNotice && (
        <div
          style={{
            background: 'rgba(52, 211, 153, 0.1)',
            border: '1px solid rgba(52, 211, 153, 0.3)',
            borderRadius: '6px',
            padding: '0.5rem 0.75rem',
            color: 'var(--accent-emerald)',
            fontSize: '0.8rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            marginBottom: '1rem'
          }}
        >
          <Icon name="check" size={15} />
          <span>Local schema modifications saved to current browser session (Mock Mode).</span>
        </div>
      )}

      {/* Tabs */}
      <div className="tabs-nav">
        <button
          className={`tab-btn ${activeTab === 'editor' ? 'active' : ''}`}
          onClick={() => setActiveTab('editor')}
        >
          <Icon name="code" size={15} />
          <span>JSON Schema Definition</span>
        </button>
        <button
          className={`tab-btn ${activeTab === 'fields' ? 'active' : ''}`}
          onClick={() => setActiveTab('fields')}
        >
          <Icon name="fileText" size={15} />
          <span>Field Contract ({parsedProperties.length})</span>
        </button>
        <button
          className={`tab-btn ${activeTab === 'sandbox' ? 'active' : ''}`}
          onClick={() => setActiveTab('sandbox')}
        >
          <Icon name="play" size={15} />
          <span>Test Sandbox</span>
        </button>
      </div>

      {/* Tab 1: Editor View */}
      {activeTab === 'editor' && (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Editable JSON Schema (Draft-7 Specification)
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem' }}>
              <span
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  background: jsonError ? 'var(--accent-rose)' : 'var(--accent-emerald)'
                }}
              />
              <span style={{ color: jsonError ? 'var(--accent-rose)' : 'var(--accent-emerald)', fontWeight: 600 }}>
                {jsonError ? 'Syntax Error' : 'Valid JSON'}
              </span>
            </div>
          </div>

          <textarea
            className="form-textarea"
            rows="16"
            value={editableJson}
            onChange={(e) => handleJsonChange(e.target.value)}
            spellCheck="false"
            style={{
              width: '100%',
              borderColor: jsonError ? 'var(--accent-rose)' : 'var(--border-subtle)',
              background: '#06080f',
              color: '#a5f3fc'
            }}
          />

          {jsonError && (
            <div style={{ marginTop: '0.5rem', color: 'var(--accent-rose)', fontSize: '0.75rem', fontFamily: 'var(--font-mono)' }}>
              Error: {jsonError}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Parsed Field Contract */}
      {activeTab === 'fields' && (
        <div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
            Properties parsed from the schema definition that must be present in incoming events:
          </div>

          {parsedProperties.length === 0 ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              No structured properties declared in this schema definition.
            </div>
          ) : (
            <div className="table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Property Name</th>
                    <th>Expected Type</th>
                    <th>Required</th>
                    <th>Constraints / Rules</th>
                  </tr>
                </thead>
                <tbody>
                  {parsedProperties.map((p) => (
                    <tr key={p.name}>
                      <td className="mono-cell" style={{ fontWeight: 600 }}>
                        {p.name}
                      </td>
                      <td>
                        <span className="badge badge-neutral" style={{ fontFamily: 'var(--font-mono)' }}>
                          {p.type}
                        </span>
                      </td>
                      <td>
                        {p.isRequired ? (
                          <span className="badge badge-rose">Required</span>
                        ) : (
                          <span className="badge badge-neutral">Optional</span>
                        )}
                      </td>
                      <td style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', fontFamily: 'var(--font-mono)' }}>
                        {p.constraints}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Interactive Sandbox */}
      {activeTab === 'sandbox' && (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span className="form-label">Test Event Payload (JSON)</span>
                <button
                  className="btn btn-secondary"
                  onClick={() => setTestPayload(schema.samplePayload)}
                  style={{ padding: '0.2rem 0.5rem', fontSize: '0.7rem' }}
                >
                  Reset Sample
                </button>
              </div>
              <textarea
                className="form-textarea"
                rows="10"
                value={testPayload}
                onChange={(e) => setTestPayload(e.target.value)}
                spellCheck="false"
                style={{ width: '100%', background: '#06080f', color: '#f8fafc' }}
              />
            </div>

            <div>
              <div style={{ marginBottom: '0.5rem' }}>
                <span className="form-label">Validation Feedback</span>
              </div>

              <div
                style={{
                  background: 'var(--bg-canvas)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '6px',
                  padding: '1rem',
                  minHeight: '210px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center'
                }}
              >
                {!validationResult && (
                  <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                    <Icon name="play" size={24} color="var(--accent-cyan)" style={{ marginBottom: '0.5rem' }} />
                    <p style={{ fontSize: '0.8rem' }}>
                      Click <strong>"Run Validation"</strong> to simulate how NetworkNT Draft-7 validates this event payload.
                    </p>
                  </div>
                )}

                {validationResult && validationResult.valid && (
                  <div style={{ textAlign: 'center', color: 'var(--accent-emerald)' }}>
                    <Icon name="check" size={32} color="var(--accent-emerald)" style={{ marginBottom: '0.5rem' }} />
                    <div style={{ fontWeight: 600, fontSize: '0.95rem', marginBottom: '0.25rem' }}>
                      Payload Conforms to Schema!
                    </div>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>
                      All required fields are present and types match Draft-7 contract.
                    </div>
                  </div>
                )}

                {validationResult && !validationResult.valid && (
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent-rose)', fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.75rem' }}>
                      <Icon name="alert" size={18} color="var(--accent-rose)" />
                      <span>Validation Failed (Simulated 400 Bad Request)</span>
                    </div>
                    <ul style={{ paddingLeft: '1.25rem', color: 'var(--text-secondary)', fontSize: '0.75rem', lineHeight: 1.6 }}>
                      {validationResult.errors.map((err, idx) => (
                        <li key={idx} style={{ color: 'var(--accent-rose)' }}>
                          {err}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button className="btn btn-cyan" onClick={handleRunValidation}>
              <Icon name="play" size={14} />
              <span>Run Validation (NetworkNT Simulator)</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
