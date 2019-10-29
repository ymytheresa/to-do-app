import { Component, OnInit, ViewChild } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { LoadingController } from '@ionic/angular';
import { Router, ActivatedRoute } from '@angular/router';
import { AlertController } from 'ionic-angular';
import { FirebaseService } from '../services/firebase.service';
import { Validators, FormBuilder, FormGroup, FormControl } from '@angular/forms';
import { invalid } from '@angular/compiler/src/render3/view/util';

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
				
				//*********************************
				this.items.sort((a, b) => {
					var aP = parseInt(a.payload.doc.data().priority);
					var bP = parseInt(b.payload.doc.data().priority);
					var aD = parseInt(a.payload.doc.data().duration);
					var bD = parseInt(b.payload.doc.data().duration);

					if (aP != bP) 
						return aP - bP;
					else 
						return bD - aD;
				});
				//*********************************
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
			//*********************************
			// duration: value.duration,
			// priority: value.priority
			//*********************************
			//Below parsing can eliminate the zeros appending behind the decimal points, e.g. 1.0000 -> 1
			duration: parseFloat(value.duration),
			priority: parseFloat(value.priority)
			//*********************************
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

		//*********************************
		alert.backdropDismiss = false;
		//*********************************

		alert.buttons = [
			{
				text: 'Cancel',
				role: 'cancel',
				cssClass: 'secondary',
				handler: () =>
				{
					console.log('Confirm Cancel');
					
					//*********************************
					alert.dismiss();
					//*********************************

				}
			}, {
				text: 'Ok',
				handler: (data) =>
				{
					//*********************************
					// this.onSubmit(data);
					// console.log(alert);
					//*********************************
					//Note: float input is invalid. Only int input is accepted.
					let duration = parseFloat(data.duration);
					let priority = parseFloat(data.priority);

					if (isNaN(duration) || isNaN(priority) || 
						duration % 1 !== 0 || priority % 1 !== 0 || //check if int
						duration <= 0 || priority < 1){
						const invalidInputAlert = document.createElement('ion-alert');
						invalidInputAlert.header = 'Invalid Input';
						invalidInputAlert.message = "Please check the validity of your input."
						invalidInputAlert.buttons = [{text: 'Ok', cssClass: 'secondary', handler: () => {
							console.log('Invalid input msg well received.');
						}}];
						document.body.appendChild(invalidInputAlert);
						invalidInputAlert.present();
						return false; //return false so that the alert is not dismissed
					}else
					{
						this.onSubmit(data);
						console.log(alert);
						return true;
					}
					//*********************************
				}
			}
		];

		document.body.appendChild(alert);
		return alert.present();
	}

	delete(itemEntry)
	{
		//*********************************
		// this.firebaseService.deleteTask(item.payload.doc.id)
		//*********************************
		console.log("id: " + itemEntry['el'].getAttribute('item-id'));
		var itemId = itemEntry['el'].getAttribute('item-id');
		this.firebaseService.deleteTask(itemId)
		//*********************************
			.then(
				res =>
				{
					this.router.navigate(["/home"]);
				},
				err => console.log(err)
			)
	}

}
