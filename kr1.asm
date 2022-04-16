.486

Data1 		segment	use16
	String		db		'String'
	Val				db		101b
	Vw 				dw 		1234d
	Vd 				dd 		0d7856fdah
Data1 		ends

Data2 		segment use16
	Var				dw 		123
	QWERTY		dd		67ff89h
	Zxcv			db		89h
Data2 			Ends

Code1 		segment	use16
Assume 	cs:Code1, ds:Data1, gs:Data2
begin:	
	nop
	nop
	nop

	mov	 	al, 3
	mov 	bl, 2
	imul 	bl

	mov 	eax, 5   
	mov 	byte ptr [ebx + ecx], 2 
	mul	  byte ptr [ebx + ecx]

	mov al, 10
	mov bl, 5
	idiv bl

	mov al, 3
	mov byte ptr [edx + esi], 7
	adc al, byte ptr [edx + esi]

	or byte ptr [edx + esi], 111b

	mov eax, 10
	mov dword ptr [ebx + ecx], 12
	sub dword ptr [ebx + ecx], eax
	mov edx, dword ptr [ebx + ecx]

	Jmp		short label1

label1:
	mov al, 10
	cmp al, 10
	jnb far ptr Code2:label2
Code1 		ends

Code2 segment use16
Assume cs:Code2, ds:Data1, gs:Data2
label2:
	nop
	nop
	nop
Code2 		ends
end begin