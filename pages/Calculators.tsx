
import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { CalculatorDefinition, CalculatorInput } from '../types';
import { Calculator, ChevronRight, RefreshCw, CheckCircle2, Check, ArrowLeft } from 'lucide-react';

// --- CALCULATOR DEFINITIONS ---
const GCS_CALC: CalculatorDefinition = {
  id: 'gcs',
  name: 'Glasgow Coma Scale (GCS)',
  description: 'Assess level of consciousness',
  inputs: [
    {
      id: 'eye',
      label: 'Eye Opening Response',
      type: 'select',
      options: [
        { value: 4, label: 'Spontaneously (4)' },
        { value: 3, label: 'To speech (3)' },
        { value: 2, label: 'To pain (2)' },
        { value: 1, label: 'No response (1)' }
      ]
    },
    {
      id: 'verbal',
      label: 'Verbal Response',
      type: 'select',
      options: [
        { value: 5, label: 'Oriented to time, place, and person (5)' },
        { value: 4, label: 'Confused (4)' },
        { value: 3, label: 'Inappropriate words (3)' },
        { value: 2, label: 'Incomprehensible sounds (2)' },
        { value: 1, label: 'No response (1)' }
      ]
    },
    {
      id: 'motor',
      label: 'Motor Response',
      type: 'select',
      options: [
        { value: 6, label: 'Obeys commands (6)' },
        { value: 5, label: 'Moves to localized pain (5)' },
        { value: 4, label: 'Flexion withdrawal from pain (4)' },
        { value: 3, label: 'Abnormal flexion (decorticate) (3)' },
        { value: 2, label: 'Abnormal extension (decerebrate) (2)' },
        { value: 1, label: 'No response (1)' }
      ]
    }
  ],
  calculate: (values) => {
    const score = (Number(values.eye) || 0) + (Number(values.verbal) || 0) + (Number(values.motor) || 0);
    let interp = "Severe Brain Injury (Coma)";
    if (score >= 13) interp = "Minor Brain Injury";
    else if (score >= 9) interp = "Moderate Brain Injury";
    return { score, interpretation: interp };
  }
};

const ABCD2_CALC: CalculatorDefinition = {
  id: 'abcd2',
  name: 'ABCD² Score for TIA',
  description: 'Estimates the risk of stroke within 2 days after a Transient Ischemic Attack (TIA).',
  inputs: [
    { id: 'age', label: 'Age >= 60 years', type: 'boolean' },
    { id: 'bp', label: 'BP >= 140/90 mmHg', type: 'boolean' },
    {
      id: 'clinical',
      label: 'Clinical Features',
      type: 'select',
      options: [
        { value: 2, label: 'Unilateral weakness (2)' },
        { value: 1, label: 'Speech impairment without weakness (1)' },
        { value: 0, label: 'Other symptoms (0)' }
      ]
    },
    {
      id: 'duration',
      label: 'Duration of Symptoms',
      type: 'select',
      options: [
        { value: 2, label: '>= 60 minutes (2)' },
        { value: 1, label: '10-59 minutes (1)' },
        { value: 0, label: '< 10 minutes (0)' }
      ]
    },
    { id: 'diabetes', label: 'Diabetes', type: 'boolean' }
  ],
  calculate: (values) => {
    let score = 0;
    if (values.age) score += 1;
    if (values.bp) score += 1;
    if (values.diabetes) score += 1;
    score += Number(values.clinical || 0);
    score += Number(values.duration || 0);
    let risk = "Low Risk (1.0% 2-day stroke risk)";
    if (score >= 6) risk = "High Risk (8.1% 2-day stroke risk)";
    else if (score >= 4) risk = "Moderate Risk (4.1% 2-day stroke risk)";
    return { score, interpretation: risk };
  }
};

const NIHSS_CALC: CalculatorDefinition = {
  id: 'nihss',
  name: 'NIH Stroke Scale (NIHSS)',
  description: 'Quantifies the impairment caused by a stroke. Scores range from 0 to 42.',
  inputs: [
    {
      id: '1a',
      label: '1a. Level of Consciousness',
      type: 'select',
      options: [
        { value: 0, label: '0 - Alert' },
        { value: 1, label: '1 - Not alert; aroused with minor stimulation' },
        { value: 2, label: '2 - Not alert; requires repeated stimulation' },
        { value: 3, label: '3 - Unresponsive or reflex movements only' }
      ]
    }
  ],
  calculate: (values) => {
    let score = 0;
    Object.keys(values).forEach(f => { score += Number(values[f] || 0); });
    let interpretation = score === 0 ? "No stroke symptoms" : score <= 4 ? "Minor stroke" : "Stroke";
    return { score, interpretation };
  }
};

const CALCULATORS = [GCS_CALC, NIHSS_CALC, ABCD2_CALC];

const Calculators: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeId = searchParams.get('id');
  
  const activeCalc = CALCULATORS.find(c => c.id === activeId);
