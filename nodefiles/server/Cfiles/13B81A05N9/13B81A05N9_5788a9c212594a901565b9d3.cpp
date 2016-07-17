#include<stdio.h>
int main()
{
int n;
int a,b;
scanf("%d",&n);
int i=0;

for(i=0;i<n;i++)
{
scanf("%d",&a);
scanf("%d",&b);
if(i!=n-1)
printf("%d\n",a*b);
else
printf("%d",a*b);
}
return 0;
}
