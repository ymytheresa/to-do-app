import { Component, OnInit, ViewChild } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { LoadingController } from '@ionic/angular';
import { Router, ActivatedRoute } from '@angular/router';
import { AlertController } from 'ionic-angular';
import { FirebaseService } from '../services/firebase.service';
import { Validators, FormBuilder, FormGroup, FormControl } from '@angular/forms';

@Component({
	selector: 'app-home',
	templateUrl: './home.page.html',
	styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit
{

	items: Array<any>;
	item: any;
	@ViewChild('observeForm') obsForm: any;

	constructor(
		public loadingCtrl: LoadingController,
		private authService: AuthService,
		private router: Router,
		private firebaseService: FirebaseService,
		private route: ActivatedRoute,
		private formBuilder: FormBuilder
	) { }

	ngOnInit()
	{
		if (this.route && this.route.data)
		{
			this.getData();
		}
	}

	async getData()
	{
		const loading = await this.loadingCtrl.create({
			message: 'Please wait...'
		});
		this.presentLoading(loading);

		this.route.data.subscribe(routeData =>
		{
			routeData['data'].subscribe(data =>
			{
				loading.dismiss();
				this.items = data;
			})
		})
	}

	async presentLoading(loading)
	{
		return await loading.present();
	}

	logout()
	{
		this.authService.doLogout()
			.then(res =>
			{
				this.router.navigate(["/login"]);
			}, err =>
			{
				console.log(err);
			})
	}

	onSubmit(value)
	{
		let data = {
			taskName: value.taskName,
			duration: value.duration,
			priority: value.priority
		}
		this.firebaseService.createTask(data)
			.then(
				res =>
				{
					this.router.navigate(["/home"]);
				}
			)
	}

	presentAlert()
	{
		const alert = document.createElement('ion-alert');
		alert.header = 'New Task';
		alert.inputs = [
			{
				name: 'taskName',
				id: 'taskName-id',
				placeholder: 'Task Description'
			},
			{
				name: 'duration',
				id: 'duration-id',
				type: 'number',
				placeholder: '# Minutes'
			},
			{
				name: 'priority',
				id: 'priority-id',
				type: 'number',
				placeholder: '1 = Highest priority',
			}
		];
		alert.buttons = [
			{
				text: 'Cancel',
				role: 'cancel',
				cssClass: 'secondary',
				handler: () =>
				{
					console.log('Confirm Cancel')
				}
			}, {
				text: 'Ok',
				handler: (data) =>
				{
					this.onSubmit(data);
					console.log(alert);
				}
			}
		];

		document.body.appendChild(alert);
		return alert.present();
	}

	delete()
	{
		this.firebaseService.deleteTask(this.item.id)
			.then(
				res =>
				{
					this.router.navigate(["/home"]);
				},
				err => console.log(err)
			)
	}

}
