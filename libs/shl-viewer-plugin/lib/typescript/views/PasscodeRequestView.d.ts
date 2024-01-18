import React from 'react';
type PasscodeRequestViewProp = {
    onEntered: (number: string) => void;
    onCancel: () => void;
};
declare const PasscodeRequestView: React.FC<PasscodeRequestViewProp>;
export default PasscodeRequestView;
