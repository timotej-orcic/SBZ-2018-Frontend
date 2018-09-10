import { FormGroup } from '@angular/forms';

export class PasswordValidator {

    static MatchPassword(formGroup: FormGroup) {
        const password = formGroup.controls.password.value;
        const confirmPassword = formGroup.controls.confirmPassword.value;

        if (confirmPassword !== password) {
            return {
                doesNotMatchPassword: true
            };
        }

        return null;
    }
}
