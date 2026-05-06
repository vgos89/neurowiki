import React, { useEffect } from 'react';
import StrokeBasicsWorkflowV2 from './StrokeBasicsWorkflowV2';
import { useRecents } from '../../hooks/useRecents';

export default function StrokeBasics() {
  const { recordView } = useRecents();

  useEffect(() => {
    recordView({
      type: 'pathway',
      id: 'stroke-code',
      title: 'Stroke Code',
      subtitle: 'Door-to-needle protocol for hyperacute ischemic stroke',
      category: 'acute-stroke',
      trail: '4 steps',
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <StrokeBasicsWorkflowV2 />;
}
