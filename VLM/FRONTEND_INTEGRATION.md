# 🎯 Frontend Integration Guide

## New Response Format

### **POST /detect Response**

```json
{
  "injuries_detected": [
    {
      "label": "heavy bleeding",
      "confidence": 0.92
    },
    {
      "label": "head wound with blood", 
      "confidence": 0.71
    }
  ],
  "severity": "critical",
  "rag_answer": "Condition: Heavy bleeding from head wound...",
  "questions": [
    {
      "id": "bleeding_severity",
      "question": "How severe is the bleeding?",
      "options": ["minor", "moderate", "severe"],
      "type": "selection"
    },
    {
      "id": "bleeding_flow",
      "question": "Is the bleeding continuous or stopping?",
      "options": ["continuous", "intermittent", "stopped"],
      "type": "selection"
    },
    {
      "id": "consciousness",
      "question": "Is the person conscious and alert?",
      "options": ["yes", "drowsy", "unconscious"],
      "type": "selection"
    }
  ],
  "rag_sources": [
    "First aid for head wounds: Apply direct pressure with clean cloth...",
    "Bleeding control: Elevate the wound above heart level..."
  ],
  "low_confidence": false
}
```

---

## React Component Example

```jsx
import React, { useState } from 'react';
import axios from 'axios';

export function DetectionUI() {
  const [response, setResponse] = useState(null);
  const [answers, setAnswers] = useState({});
  const [refinedSeverity, setRefinedSeverity] = useState(null);

  // Handle image upload
  const handleDetect = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      const res = await axios.post('http://localhost:8000/detect', formData);
      setResponse(res.data);
      setAnswers({}); // Reset answers
      setRefinedSeverity(null);
    } catch (error) {
      console.error('Detection failed:', error);
    }
  };

  // Handle question answer
  const handleAnswer = (questionId, value) => {
    setAnswers({
      ...answers,
      [questionId]: value
    });
  };

  // Refine severity based on answers
  const handleRefine = async () => {
    try {
      const res = await axios.post('http://localhost:8000/refine', {
        answers: answers
      });
      setRefinedSeverity(res.data);
    } catch (error) {
      console.error('Refinement failed:', error);
    }
  };

  return (
    <div>
      {/* Detection Results */}
      {response && (
        <>
          {/* Severity Badge */}
          <div className={`severity-${response.severity}`}>
            Severity: {response.severity.toUpperCase()}
            {refinedSeverity && (
              <span> → REFINED: {refinedSeverity.severity.toUpperCase()}</span>
            )}
          </div>

          {/* Detected Injuries */}
          <div className="injuries">
            {response.injuries_detected.map((inj, i) => (
              <div key={i} className="injury-card">
                <span className="label">{inj.label}</span>
                <span className="confidence">{(inj.confidence * 100).toFixed(0)}%</span>
              </div>
            ))}
          </div>

          {/* Medical Advice */}
          <div className="rag-answer">
            <h3>Medical Assessment</h3>
            <pre>{response.rag_answer}</pre>
          </div>

          {/* Structured Questions */}
          {response.questions.length > 0 && (
            <div className="questions">
              <h3>Follow-up Questions</h3>
              {response.questions.map((q) => (
                <div key={q.id} className="question">
                  <label>{q.question}</label>
                  <select 
                    value={answers[q.id] || ''} 
                    onChange={(e) => handleAnswer(q.id, e.target.value)}
                  >
                    <option value="">Select...</option>
                    {q.options.map((opt, i) => (
                      <option key={i} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>
              ))}
              <button onClick={handleRefine}>Refine Assessment</button>
            </div>
          )}

          {/* Refined Severity */}
          {refinedSeverity && (
            <div className="refined-result">
              <h3>Refined Assessment</h3>
              <p>Severity: {refinedSeverity.severity.toUpperCase()}</p>
              <p>Confidence Score: {refinedSeverity.score}/10</p>
            </div>
          )}

          {/* RAG Sources */}
          {response.rag_sources.length > 0 && (
            <div className="sources">
              <h4>Knowledge Sources</h4>
              <ul>
                {response.rag_sources.map((src, i) => (
                  <li key={i}>{src.substring(0, 150)}...</li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}
    </div>
  );
}
```

---

## TypeScript Interfaces

```typescript
// Detection Response
interface InjuryDetection {
  label: string;
  confidence: number;
}

interface Question {
  id: string;
  question: string;
  options: string[];
  type: 'selection' | 'text' | 'boolean';
}

interface DetectionResponse {
  injuries_detected: InjuryDetection[];
  severity: 'low' | 'moderate' | 'critical';
  rag_answer: string;
  questions: Question[];
  rag_sources: string[];
  low_confidence?: boolean;
}

// Refinement Request/Response
interface RefinementRequest {
  answers: Record<string, string>;
}

interface RefinementResponse {
  severity: 'low' | 'moderate' | 'critical';
  score: number;
}
```

---

## Key Changes for Frontend

### ✅ New: Structured Questions

Questions are now **objects with IDs**, not strings:

```javascript
// OLD (DON'T USE)
questions.forEach(q => console.log(q)); // ["How severe is bleeding?"]

// NEW (USE THIS)
questions.forEach(q => {
  console.log(q.id);        // "bleeding_severity"
  console.log(q.question);  // "How severe is the bleeding?"
  console.log(q.options);   // ["minor", "moderate", "severe"]
});
```

### ✅ Answer Mapping

Map question IDs to answers:

```javascript
// Build answer object from form responses
const answers = {
  "bleeding_severity": "severe",      // User selected "severe"
  "consciousness": "yes",             // User selected "yes"
  "head_symptoms": "mild"             // User selected "mild"
};

// Send to /refine endpoint
const response = await fetch('/refine', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ answers })
});
```

### ✅ Severity Progression

Show both initial and refined severity:

```javascript
// Initial severity from vision
console.log(detectionResponse.severity); // "moderate"

// After user answers questions
const refinement = await refineEndpoint(answers);
console.log(refinement.severity);        // "critical" (maybe escalated)
console.log(refinement.score);           // 8 (confidence score)
```

---

## Common Patterns

### Pattern 1: Question Rendering Loop

```jsx
{response.questions.map(question => (
  <div key={question.id} className="question-block">
    <label>{question.question}</label>
    <fieldset>
      {question.options.map(option => (
        <label key={option}>
          <input 
            type="radio" 
            name={question.id}
            value={option}
            onChange={() => handleAnswer(question.id, option)}
            checked={answers[question.id] === option}
          />
          {option}
        </label>
      ))}
    </fieldset>
  </div>
))}
```

### Pattern 2: Dynamic Styling Based on Severity

```jsx
const severityStyles = {
  low: { bg: 'green-100', border: 'green-500', text: 'green-900' },
  moderate: { bg: 'yellow-100', border: 'yellow-500', text: 'yellow-900' },
  critical: { bg: 'red-100', border: 'red-500', text: 'red-900' }
};

const style = severityStyles[response.severity];

<div className={`bg-${style.bg} border-2 border-${style.border} text-${style.text} p-4`}>
  {response.severity.toUpperCase()}
</div>
```

### Pattern 3: Error Handling

```javascript
const handleDetect = async (file) => {
  try {
    const res = await axios.post('/detect', formData);
    
    // Handle low confidence
    if (res.data.low_confidence) {
      console.warn('Low confidence detection. Recommend better image.');
    }
    
    setResponse(res.data);
  } catch (error) {
    if (error.response?.status === 422) {
      console.error('Invalid image format');
    } else {
      console.error('Detection error:', error.message);
    }
  }
};
```

---

## Updated TraumaTriage.jsx Integration

```jsx
// Example using refactored backend

import { useState } from 'react';

export default function TraumaTriage() {
  const [detection, setDetection] = useState(null);
  const [answers, setAnswers] = useState({});
  
  const sendImage = async (file) => {
    const fd = new FormData();
    fd.append('file', file);
    
    const res = await fetch('http://localhost:8000/detect', {
      method: 'POST',
      body: fd
    });
    
    const data = await res.json();
    setDetection(data);
  };
  
  const submitAnswers = async () => {
    const res = await fetch('http://localhost:8000/refine', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ answers })
    });
    
    const refined = await res.json();
    // Update UI with refined severity
    console.log(`Refined severity: ${refined.severity} (score: ${refined.score})`);
  };
  
  return (
    <div>
      {detection && (
        <>
          <h2>{detection.severity.toUpperCase()}</h2>
          
          {/* Injuries */}
          {detection.injuries_detected.map(inj => (
            <p key={inj.label}>{inj.label} ({inj.confidence})</p>
          ))}
          
          {/* Questions with new structure */}
          {detection.questions.map(q => (
            <div key={q.id}>
              <p>{q.question}</p>
              <select onChange={e => setAnswers({...answers, [q.id]: e.target.value})}>
                <option>--Select--</option>
                {q.options.map(opt => <option key={opt}>{opt}</option>)}
              </select>
            </div>
          ))}
          
          <button onClick={submitAnswers}>Refine Assessment</button>
        </>
      )}
    </div>
  );
}
```

---

## Debugging Tips

### Check What Questions Are Generated
```js
console.log('Available questions:', response.questions);
// Look for question.id to build answers object
```

### Verify Answer Format
```js
console.log('Answer payload:', { answers });
// Should be { answers: { "question_id": "option_value", ... } }
```

### Monitor Refinement Flow
```js
const refine = async () => {
  console.log('Sending answers:', answers);
  const res = await fetch('/refine', { body: JSON.stringify({ answers }) });
  const data = await res.json();
  console.log('Refined:', data);
};
```

---

**Version:** 2.0  
**Updated:** May 24, 2026
