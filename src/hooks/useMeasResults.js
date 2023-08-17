//This file is a suggestion of how the data from a measure
//  could be consumed inside React components
/*
import { useState, useEffect } from "react";
import { useImmer } from "use-immer";   //suggest usage of immer, since there will be a large body of data being updated point by point

export const useMeasResults = (port, command) => {
    const [status, setStatus] = useState('idle');
    const [progress, setProgress] = useState(0);
    const points = useImmer([]);
    
    useEffect(() => {
        setProgress(0);
        setStatus('running');
        //TODO:
        //  send command
        //  treat errors, if not OK
        //  push results to points after each line
        //  update progress
        //  special case: line END update status to 'done' when finished
    }, [port, command]);

    return {status, progress, points};
}
*/